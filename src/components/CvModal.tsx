import React, { useEffect, useMemo } from 'react';
import { Download, ExternalLink, FileText, X } from 'lucide-react';

interface CvModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvUrl: string;
  cvFileName: string;
  fullName: string;
  onContactClick: () => void;
  documentType?: 'cv' | 'cover-letter';
}

export const CvModal: React.FC<CvModalProps> = ({
  isOpen,
  onClose,
  cvUrl,
  cvFileName,
  fullName,
  onContactClick,
  documentType = 'cv',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const resolvedPdfUrl = useMemo(() => {
    if (!cvUrl) return '';
    if (!cvUrl.startsWith('data:application/pdf;base64,')) return cvUrl;
    try {
      const base64 = cvUrl.split(',')[1] || '';
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch {
      return cvUrl;
    }
  }, [cvUrl]);

  useEffect(() => {
    return () => {
      if (resolvedPdfUrl && resolvedPdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resolvedPdfUrl);
      }
    };
  }, [resolvedPdfUrl]);

  if (!isOpen) return null;

  const hasCv = Boolean(cvUrl && cvUrl.trim().length > 0);
  const isCoverLetter = documentType === 'cover-letter';
  const docLabel = isCoverLetter ? 'Cover Letter' : 'Curriculum Vitae';
  const defaultFileName = isCoverLetter ? 'MD_AL_AMIN_Cover_Letter.pdf' : 'MD_AL_AMIN_CV.pdf';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-3xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center text-[#315E9B] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 id="cv-modal-title" className="text-base font-semibold text-[#202124] truncate">
                {fullName} — {docLabel}
              </h2>
              <p className="text-xs text-[#6B7280] truncate">
                {hasCv ? cvFileName || defaultFileName : 'Pending PDF Upload in Admin CMS'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${docLabel} modal`}
            className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#202124] hover:bg-[#F7F8FA] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {hasCv ? (
          <>
            <div className="bg-[#F7F8FA] h-[60vh] w-full">
              <iframe
                src={resolvedPdfUrl}
                title={`${fullName} ${docLabel} Preview`}
                className="w-full h-full border-0"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-white">
              <p className="text-xs text-[#6B7280]">
                Original PDF published directly from the portfolio CMS.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={resolvedPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#202124] bg-[#F7F8FA] hover:bg-[#E5E7EB]/60 border border-[#E5E7EB] rounded-lg transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in New Tab</span>
                </a>
                <a
                  href={resolvedPdfUrl}
                  download={cvFileName || defaultFileName}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg transition-colors whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center text-[#315E9B] mx-auto mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#202124] mb-2">
              {docLabel} PDF Not Yet Published
            </h3>
            <p className="text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed mb-6">
              The latest {docLabel} PDF can be uploaded and published by the administrator in the
              Admin Dashboard under CV &amp; Site Settings. In the meantime, you may contact{' '}
              {fullName} directly to request a copy.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onContactClick();
                }}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg transition-colors"
              >
                Go to Contact Section
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-[#202124] bg-white border border-[#E5E7EB] hover:bg-[#F7F8FA] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
