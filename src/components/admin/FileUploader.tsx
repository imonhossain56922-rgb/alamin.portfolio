import React, { useRef, useState } from 'react';
import { CheckCircle2, FileText, Film, Upload, X } from 'lucide-react';
import {
  uploadFileToStorage,
  validateImageFile,
  validatePdfFile,
  validateVideoFile,
} from '../../lib/storageService';

interface FileUploaderProps {
  mode: 'image' | 'pdf' | 'video';
  folderPath: string;
  label: string;
  currentUrl?: string;
  onUploaded: (url: string, fileName: string) => void;
  allowManualUrl?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  mode,
  folderPath,
  label,
  currentUrl,
  onUploaded,
  allowManualUrl = true,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    const validationError =
      mode === 'image'
        ? validateImageFile(file)
        : mode === 'video'
          ? validateVideoFile(file)
          : validatePdfFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (mode === 'image') {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    }

    setProgress(5);
    try {
      const { promise } = uploadFileToStorage(file, folderPath, (pct) => setProgress(pct));
      const result = await promise;
      setProgress(null);
      setSuccess(
        result.storageMode === 'firebase-storage'
          ? `Uploaded ${result.fileName} to Firebase Storage`
          : mode === 'video'
            ? `Uploaded ${result.fileName} (click Publish / Update Project to attach)`
            : `Ready: ${result.fileName} optimized (click Save to apply)`
      );
      setPreviewUrl(null);
      onUploaded(result.url, result.fileName);
    } catch (err) {
      setProgress(null);
      setPreviewUrl(null);
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const displayPreview = previewUrl || currentUrl;
  const isDataUrl = Boolean(
    currentUrl &&
      (currentUrl.startsWith('data:') || currentUrl.startsWith('firestore-video://'))
  );

  const acceptAttr =
    mode === 'image'
      ? 'image/*'
      : mode === 'video'
        ? 'video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.m4v,.ogg,.avi'
        : 'application/pdf,.pdf';

  const buttonLabel =
    progress !== null
      ? `Uploading ${progress}%...`
      : mode === 'image'
        ? 'Choose & Upload Image'
        : mode === 'video'
          ? 'Choose & Upload Video'
          : 'Choose & Upload PDF';

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-[#202124]">{label}</label>
        {currentUrl && (
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setError(null);
              onUploaded('', '');
            }}
            className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-red-600 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {mode === 'image' && displayPreview && (
          <div className="w-16 h-16 overflow-hidden shrink-0">
            <img
              src={displayPreview}
              alt="Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {mode === 'pdf' && currentUrl && (
          <div className="w-10 h-10 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] flex items-center justify-center text-[#315E9B] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        )}

        {mode === 'video' && currentUrl && (
          <div className="w-10 h-10 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] flex items-center justify-center text-[#315E9B] shrink-0">
            <Film className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 w-full space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={acceptAttr}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={progress !== null}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#202124] bg-[#F7F8FA] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            >
              <Upload className="w-3.5 h-3.5 text-[#315E9B]" />
              <span>{buttonLabel}</span>
            </button>

            {allowManualUrl && (
              <input
                type="url"
                value={isDataUrl ? '' : currentUrl || ''}
                onChange={(e) => onUploaded(e.target.value, '')}
                placeholder={
                  isDataUrl
                    ? 'Uploaded file attached (or paste external URL to replace)'
                    : mode === 'image'
                      ? 'Or paste direct image URL'
                      : mode === 'video'
                        ? 'Or paste direct video / YouTube URL'
                        : 'Or paste direct PDF URL'
                }
                className="flex-1 min-w-[200px] px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#315E9B]"
              />
            )}
          </div>

          {progress !== null && (
            <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#315E9B] transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {error && <p className="text-xs text-red-700">{error}</p>}
          {success && (
            <p className="inline-flex items-center gap-1 text-xs text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{success}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
