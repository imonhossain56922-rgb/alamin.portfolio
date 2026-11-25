import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Play, X } from 'lucide-react';
import { ProjectItem } from '../types/portfolio';
import { ProjectPlaceholderVisual } from './ProjectPlaceholderVisual';
import { MediaVideo } from './MediaVideo';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

interface MediaGalleryItem {
  type: 'image' | 'video';
  url: string;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const mediaItems = React.useMemo<MediaGalleryItem[]>(() => {
    if (!project) return [];
    const list: MediaGalleryItem[] = [];
    const seen = new Set<string>();

    if (project.coverImageUrl) {
      seen.add(`image:${project.coverImageUrl}`);
      list.push({ type: 'image', url: project.coverImageUrl });
    }
    for (const url of project.galleryVideos || []) {
      if (url && !seen.has(`video:${url}`)) {
        seen.add(`video:${url}`);
        list.push({ type: 'video', url });
      }
    }
    for (const url of project.galleryImages || []) {
      if (url && !seen.has(`image:${url}`)) {
        seen.add(`image:${url}`);
        list.push({ type: 'image', url });
      }
    }
    return list;
  }, [project]);

  useEffect(() => {
    setActiveIndex(0);
    setLightboxOpen(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxOpen) {
          setLightboxOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' && mediaItems.length > 1) {
        setActiveIndex((prev) => (prev + 1) % mediaItems.length);
      } else if (e.key === 'ArrowLeft' && mediaItems.length > 1) {
        setActiveIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [project, lightboxOpen, mediaItems.length, onClose]);

  if (!project) return null;

  const currentMedia = mediaItems[activeIndex] || null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/65 backdrop-blur-xs p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#315E9B] truncate">
              {project.categoryName}
              {project.completionDate ? ` · ${project.completionDate}` : ''}
            </p>
            <h2
              id="project-modal-title"
              className="font-display text-lg md:text-xl font-bold text-[#202124] truncate"
            >
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#202124] hover:bg-[#F7F8FA] transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Showcase Area */}
        <div className="p-6 md:p-8 space-y-8">
          <div className="relative bg-[#F7F8FA] overflow-hidden aspect-[16/10]">
            {currentMedia ? (
              currentMedia.type === 'video' ? (
                <MediaVideo
                  key={currentMedia.url}
                  src={currentMedia.url}
                  title={`${project.title} video ${activeIndex + 1}`}
                  controls
                  playsInline
                  className="w-full h-full object-contain bg-[#111827]"
                />
              ) : (
                <>
                  <img
                    src={currentMedia.url}
                    alt={`${project.title} visual ${activeIndex + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain bg-[#F7F8FA]"
                  />
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    aria-label="Open fullscreen lightbox"
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#202124] bg-white/90 hover:bg-white border border-[#E5E7EB] rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#315E9B]" />
                    <span>Preview Fullscreen</span>
                  </button>
                </>
              )
            ) : (
              <ProjectPlaceholderVisual categoryName={project.categoryName} title={project.title} />
            )}

            {mediaItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
                  }
                  aria-label="Previous media item"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-[#E5E7EB] flex items-center justify-center text-[#202124] shadow-xs transition-colors cursor-pointer z-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % mediaItems.length)}
                  aria-label="Next media item"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-[#E5E7EB] flex items-center justify-center text-[#202124] shadow-xs transition-colors cursor-pointer z-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip for Multi-Media Gallery */}
          {mediaItems.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {mediaItems.map((item, idx) => (
                <button
                  key={`${item.type}-${item.url}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={
                    item.type === 'video' ? `Play video ${idx + 1}` : `View image ${idx + 1}`
                  }
                  className={`relative w-20 h-14 overflow-hidden transition-all shrink-0 cursor-pointer pb-0.5 ${
                    idx === activeIndex
                      ? 'opacity-100 border-b-2 border-[#315E9B]'
                      : 'opacity-65 hover:opacity-100'
                  }`}
                >
                  {item.type === 'video' ? (
                    <>
                      <MediaVideo
                        src={item.url}
                        title={`${project.title} video thumbnail ${idx + 1}`}
                        thumbnailOnly
                        className="w-full h-full object-cover bg-[#111827]"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center bg-[#202124]/25"
                      >
                        <span className="w-6 h-6 rounded-full bg-white/95 text-[#315E9B] flex items-center justify-center shadow-xs">
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </span>
                      </span>
                    </>
                  ) : (
                    <img
                      src={item.url}
                      alt={`${project.title} thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
            <div className="md:col-span-7 space-y-5">
              <div>
                <h3 className="text-xs font-semibold tracking-wider uppercase text-[#6B7280] mb-2">
                  Project Overview
                </h3>
                <p className="text-sm md:text-[15px] text-[#202124]/85 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {project.projectDetails && (
                <div>
                  <h3 className="text-xs font-semibold tracking-wider uppercase text-[#6B7280] mb-2">
                    Production &amp; Technical Notes
                  </h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-line">
                    {project.projectDetails}
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-5">
              <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-5 space-y-4">
                <div>
                  <p className="text-xs text-[#6B7280] mb-0.5">Category</p>
                  <p className="text-sm font-semibold text-[#202124]">{project.categoryName}</p>
                </div>

                {project.printingTechnology && (
                  <div className="pt-3 border-t border-[#E5E7EB]">
                    <p className="text-xs text-[#6B7280] mb-0.5">Printing / Production Method</p>
                    <p className="text-sm font-semibold text-[#202124]">
                      {project.printingTechnology}
                    </p>
                  </div>
                )}

                {project.softwareUsed && project.softwareUsed.length > 0 && (
                  <div className="pt-3 border-t border-[#E5E7EB]">
                    <p className="text-xs text-[#6B7280] mb-1">Software Used</p>
                    <p className="text-sm font-medium text-[#202124]">
                      {project.softwareUsed.join(' · ')}
                    </p>
                  </div>
                )}

                {project.completionDate && (
                  <div className="pt-3 border-t border-[#E5E7EB]">
                    <p className="text-xs text-[#6B7280] mb-0.5">Timeline / Status</p>
                    <p className="text-sm font-medium text-[#202124] tabular-nums">
                      {project.completionDate}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox (Images) */}
      {lightboxOpen && currentMedia?.type === 'image' && (
        <div
          className="fixed inset-0 z-[60] bg-[#202124]/95 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(false);
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            aria-label="Exit fullscreen preview"
            className="absolute top-5 right-5 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={currentMedia.url}
            alt={`${project.title} fullscreen`}
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};
