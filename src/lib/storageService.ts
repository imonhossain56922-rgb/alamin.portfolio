import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
  UploadTask,
} from 'firebase/storage';
import { storage } from './firebase';

export type StorageFolder = 'profile' | 'projects' | 'cv' | 'software' | 'assets';

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB raw before compression
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB for Firebase Storage
const MAX_FALLBACK_PDF_BYTES = 680 * 1024; // ~680KB raw -> ~910KB base64 fits in Firestore

export function validateImageFile(file: File): string | null {
  const isImageByType = IMAGE_MIME_TYPES.has(file.type);
  const isImageByExt = /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name);
  if (!isImageByType && !isImageByExt) {
    return 'Unsupported image format. Please upload JPG, PNG, WebP, GIF, or SVG.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image file exceeds the 10 MB size limit.';
  }
  return null;
}

export function validatePdfFile(file: File): string | null {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return 'Unsupported document format. Please upload a PDF file.';
  }
  if (file.size > MAX_PDF_BYTES) {
    return 'CV PDF exceeds the 10 MB size limit.';
  }
  return null;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
}

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file locally.'));
    reader.readAsDataURL(file);
  });
}

async function compressImageToDataUrl(
  file: File,
  maxDim = 1100,
  targetMaxChars = 175000
): Promise<string> {
  if (file.type === 'image/svg+xml' && file.size <= 160 * 1024) {
    return fileToDataUrl(file);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = Math.min(maxDim / width, maxDim / height);
        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable for image optimization.'));
        return;
      }

      const renderAtSize = (w: number, h: number, quality: number): string => {
        canvas.width = w;
        canvas.height = h;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        return canvas.toDataURL('image/jpeg', quality);
      };

      const qualities = [0.84, 0.7, 0.56, 0.42];
      let output = renderAtSize(width, height, qualities[0]);
      for (const q of qualities) {
        output = renderAtSize(width, height, q);
        if (output.length <= targetMaxChars) {
          resolve(output);
          return;
        }
      }

      // If still above target size, progressively downscale dimensions
      let curW = width;
      let curH = height;
      for (let step = 0; step < 3 && output.length > targetMaxChars; step++) {
        curW = Math.max(200, Math.round(curW * 0.72));
        curH = Math.max(200, Math.round(curH * 0.72));
        output = renderAtSize(curW, curH, 0.55);
      }

      resolve(output);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to decode image file.'));
    };
    img.src = objectUrl;
  });
}

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  storageMode: 'firebase-storage' | 'firestore-embedded';
}

function tryFirebaseStorageUpload(
  file: File,
  folderPath: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  const safeName = `${Date.now()}_${sanitizeFileName(file.name)}`;
  const fullPath = `${folderPath}/${safeName}`;
  const storageRef = ref(storage, fullPath);
  const task: UploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type || undefined,
  });

  return new Promise<UploadResult>((resolve, reject) => {
    let settled = false;
    // Fail fast if Firebase Storage bucket is unprovisioned / CORS-blocked and stalls at 0%
    const stallTimer = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          task.cancel();
        } catch {
          // ignore
        }
        reject(new Error('Storage upload timed out.'));
      }
    }, 9000);

    task.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0 && onProgress) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(pct);
          if (pct > 0) {
            window.clearTimeout(stallTimer);
          }
        }
      },
      (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(stallTimer);
        reject(error);
      },
      async () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(stallTimer);
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, path: fullPath, fileName: file.name, storageMode: 'firebase-storage' });
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Failed to retrieve uploaded file URL.'));
        }
      }
    );
  });
}

export function uploadFileToStorage(
  file: File,
  folderPath: string,
  onProgress?: (percent: number) => void
): { promise: Promise<UploadResult> } {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  const promise = (async (): Promise<UploadResult> => {
    try {
      return await tryFirebaseStorageUpload(file, folderPath, onProgress);
    } catch {
      // Fallback when Firebase Storage bucket is not yet initialized or storage.rules is not deployed
      if (isPdf) {
        if (file.size > MAX_FALLBACK_PDF_BYTES) {
          throw new Error(
            'Firebase Storage is not active yet and this PDF is larger than 680 KB. Please compress the PDF under 680 KB or enable Firebase Storage + deploy storage.rules in Firebase Console.'
          );
        }
        onProgress?.(60);
        const dataUrl = await fileToDataUrl(file);
        onProgress?.(100);
        return {
          url: dataUrl,
          path: `embedded/${file.name}`,
          fileName: file.name,
          storageMode: 'firestore-embedded',
        };
      }

      onProgress?.(50);
      const maxDim = folderPath.startsWith('software') ? 256 : folderPath.startsWith('projects') ? 1050 : 950;
      const compressedDataUrl = await compressImageToDataUrl(file, maxDim);
      onProgress?.(100);
      return {
        url: compressedDataUrl,
        path: `embedded/${file.name}`,
        fileName: file.name,
        storageMode: 'firestore-embedded',
      };
    }
  })();

  return { promise };
}

export async function deleteStorageUrl(fileUrl: string): Promise<void> {
  if (!fileUrl || !fileUrl.includes('firebasestorage')) return;
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn('Could not delete storage object (may already be removed):', error);
  }
}
