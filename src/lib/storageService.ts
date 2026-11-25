import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
  UploadTask,
} from 'firebase/storage';
import { auth, db, storage } from './firebase';

export type StorageFolder = 'profile' | 'projects' | 'cv' | 'software' | 'assets';

export const FIRESTORE_VIDEO_PREFIX = 'firestore-video://';

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
  'video/x-m4v',
  'video/x-msvideo',
]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB raw before compression
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB for Firebase Storage
const MAX_FALLBACK_PDF_BYTES = 680 * 1024; // ~680KB raw -> ~910KB base64 fits in Firestore
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB for Firebase Storage
const MAX_FALLBACK_VIDEO_BYTES = 20 * 1024 * 1024; // 20MB chunked fallback in Firestore
const VIDEO_CHUNK_BYTES = 450 * 1024; // ~450KB binary -> ~600KB base64 per chunk (<1MB Firestore limit)

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
    return 'PDF exceeds the 10 MB size limit.';
  }
  return null;
}

export function validateVideoFile(file: File): string | null {
  const isVideoByType = VIDEO_MIME_TYPES.has(file.type) || file.type.startsWith('video/');
  const isVideoByExt = /\.(mp4|webm|mov|m4v|ogg|avi)$/i.test(file.name);
  if (!isVideoByType && !isVideoByExt) {
    return 'Unsupported video format. Please upload MP4, WebM, MOV, M4V, or OGG.';
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return 'Video file exceeds the 100 MB size limit.';
  }
  return null;
}

function inferVideoMimeType(file: File): string {
  if (file.type && /^video\/[a-zA-Z0-9.+_-]+$/.test(file.type)) {
    return file.type;
  }
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.ogg')) return 'video/ogg';
  if (lower.endsWith('.avi')) return 'video/x-msvideo';
  return 'video/mp4';
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

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, i + chunkSize);
    parts.push(String.fromCharCode(...sub));
  }
  return btoa(parts.join(''));
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
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

async function uploadVideoFallbackToFirestore(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  if (file.size > MAX_FALLBACK_VIDEO_BYTES) {
    throw new Error(
      'Firebase Storage is not active yet and this video is larger than 20 MB. Please compress the video under 20 MB, paste an external video URL, or enable Firebase Storage in Firebase Console.'
    );
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('You must be signed in as an administrator to upload videos.');
  }

  const chunkCount = Math.max(1, Math.ceil(file.size / VIDEO_CHUNK_BYTES));
  const videoId = `vid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const mimeType = inferVideoMimeType(file);

  onProgress?.(10);

  await setDoc(doc(db, 'videoAssets', videoId), {
    id: videoId,
    fileName: file.name.slice(0, 240) || 'portfolio-video.mp4',
    mimeType: mimeType.slice(0, 100),
    totalBytes: file.size,
    chunkCount,
    isPublic: true,
    ownerUid: currentUser.uid,
    createdAt: serverTimestamp(),
  });

  const BATCH_SIZE = 8;
  for (let startIdx = 0; startIdx < chunkCount; startIdx += BATCH_SIZE) {
    const batch = writeBatch(db);
    const endIdx = Math.min(chunkCount, startIdx + BATCH_SIZE);

    for (let i = startIdx; i < endIdx; i++) {
      const byteStart = i * VIDEO_CHUNK_BYTES;
      const byteEnd = Math.min(file.size, byteStart + VIDEO_CHUNK_BYTES);
      const buffer = await file.slice(byteStart, byteEnd).arrayBuffer();
      const base64Data = arrayBufferToBase64(buffer);

      batch.set(doc(db, 'videoAssets', videoId, 'chunks', `chunk-${i}`), {
        index: i,
        data: base64Data,
      });
    }

    await batch.commit();
    const pct = Math.min(98, 15 + Math.round((endIdx / chunkCount) * 83));
    onProgress?.(pct);
  }

  onProgress?.(100);
  return {
    url: `${FIRESTORE_VIDEO_PREFIX}${videoId}`,
    path: `videoAssets/${videoId}`,
    fileName: file.name,
    storageMode: 'firestore-embedded',
  };
}

export function uploadFileToStorage(
  file: File,
  folderPath: string,
  onProgress?: (percent: number) => void
): { promise: Promise<UploadResult> } {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isVideo =
    VIDEO_MIME_TYPES.has(file.type) ||
    file.type.startsWith('video/') ||
    /\.(mp4|webm|mov|m4v|ogg|avi)$/i.test(file.name);

  const promise = (async (): Promise<UploadResult> => {
    try {
      return await tryFirebaseStorageUpload(file, folderPath, onProgress);
    } catch {
      // Fallback when Firebase Storage bucket is not yet initialized or storage.rules is not deployed
      if (isVideo) {
        return uploadVideoFallbackToFirestore(file, onProgress);
      }

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

// --- Video URL Parsing & Firestore Chunked Video Playback Resolution ---

const resolvedVideoUrlCache = new Map<string, Promise<string>>();

export function resolveVideoUrl(rawUrl: string): Promise<string> {
  if (!rawUrl || !rawUrl.startsWith(FIRESTORE_VIDEO_PREFIX)) {
    return Promise.resolve(rawUrl);
  }

  const cached = resolvedVideoUrlCache.get(rawUrl);
  if (cached) return cached;

  const videoId = rawUrl.slice(FIRESTORE_VIDEO_PREFIX.length).trim();
  const loadPromise = (async () => {
    const metaSnap = await getDoc(doc(db, 'videoAssets', videoId));
    if (!metaSnap.exists()) {
      throw new Error('Uploaded video metadata not found.');
    }
    const meta = metaSnap.data() as { chunkCount?: number; mimeType?: string };
    const chunkCount = Number(meta.chunkCount) || 0;
    if (chunkCount <= 0) {
      throw new Error('Uploaded video has no chunks.');
    }

    const chunkSnaps = await Promise.all(
      Array.from({ length: chunkCount }, (_, i) =>
        getDoc(doc(db, 'videoAssets', videoId, 'chunks', `chunk-${i}`))
      )
    );

    const byteParts: Uint8Array<ArrayBuffer>[] = [];
    for (const snap of chunkSnaps) {
      if (!snap.exists()) {
        throw new Error('Video segment missing.');
      }
      const chunkData = snap.data() as { data?: string };
      if (!chunkData.data) continue;
      byteParts.push(base64ToUint8Array(chunkData.data) as Uint8Array<ArrayBuffer>);
    }

    const blob = new Blob(byteParts, { type: meta.mimeType || 'video/mp4' });
    return URL.createObjectURL(blob);
  })().catch((err) => {
    resolvedVideoUrlCache.delete(rawUrl);
    throw err;
  });

  resolvedVideoUrlCache.set(rawUrl, loadPromise);
  return loadPromise;
}

export interface ParsedVideoInfo {
  kind: 'native' | 'youtube' | 'vimeo';
  embedUrl?: string;
  youtubeThumbnail?: string;
}

export function parseVideoUrl(url: string): ParsedVideoInfo {
  if (!url) return { kind: 'native' };

  try {
    const ytShort = url.match(/^https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (ytShort) {
      const id = ytShort[1];
      return {
        kind: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${id}`,
        youtubeThumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }

    const ytWatch = url.match(
      /^https?:\/\/(?:www\.|m\.)?youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)([a-zA-Z0-9_-]{6,})/
    );
    if (ytWatch) {
      const id = ytWatch[1];
      return {
        kind: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${id}`,
        youtubeThumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }

    const vimeoMatch = url.match(/^https?:\/\/(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return {
        kind: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      };
    }
  } catch {
    // Fallback to native
  }

  return { kind: 'native' };
}

export async function deleteStorageUrl(fileUrl: string): Promise<void> {
  if (!fileUrl) return;
  if (fileUrl.startsWith(FIRESTORE_VIDEO_PREFIX)) {
    const videoId = fileUrl.slice(FIRESTORE_VIDEO_PREFIX.length).trim();
    try {
      const metaSnap = await getDoc(doc(db, 'videoAssets', videoId));
      if (metaSnap.exists()) {
        const chunkCount = Number(metaSnap.data()?.chunkCount) || 0;
        const BATCH_SIZE = 10;
        for (let startIdx = 0; startIdx < chunkCount; startIdx += BATCH_SIZE) {
          const batch = writeBatch(db);
          const endIdx = Math.min(chunkCount, startIdx + BATCH_SIZE);
          for (let i = startIdx; i < endIdx; i++) {
            batch.delete(doc(db, 'videoAssets', videoId, 'chunks', `chunk-${i}`));
          }
          await batch.commit();
        }
        await deleteDoc(doc(db, 'videoAssets', videoId));
      }
      resolvedVideoUrlCache.delete(fileUrl);
    } catch (error) {
      console.warn('Could not delete Firestore video asset:', error);
    }
    return;
  }

  if (!fileUrl.includes('firebasestorage')) return;
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn('Could not delete storage object (may already be removed):', error);
  }
}
