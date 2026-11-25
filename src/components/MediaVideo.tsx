import React, { useEffect, useState } from 'react';
import { Film, Loader2, Play } from 'lucide-react';
import { parseVideoUrl, resolveVideoUrl } from '../lib/storageService';

interface MediaVideoProps {
  src: string;
  title?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  thumbnailOnly?: boolean;
  className?: string;
}

export const MediaVideo: React.FC<MediaVideoProps> = ({
  src,
  title = 'Portfolio video',
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  playsInline = true,
  thumbnailOnly = false,
  className = 'w-full h-full object-contain bg-[#111827]',
}) => {
  const parsed = parseVideoUrl(src);
  const [resolvedSrc, setResolvedSrc] = useState<string>(() =>
    src.startsWith('firestore-video://') ? '' : src
  );
  const [loading, setLoading] = useState<boolean>(() => src.startsWith('firestore-video://'));
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setError(false);

    if (!src) {
      setResolvedSrc('');
      setLoading(false);
      return;
    }

    if (!src.startsWith('firestore-video://')) {
      setResolvedSrc(src);
      setLoading(false);
      return;
    }

    setLoading(true);
    resolveVideoUrl(src)
      .then((objectUrl) => {
        if (active) {
          setResolvedSrc(objectUrl);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [src]);

  if (parsed.kind === 'youtube' || parsed.kind === 'vimeo') {
    if (thumbnailOnly) {
      if (parsed.youtubeThumbnail) {
        return (
          <img
            src={parsed.youtubeThumbnail}
            alt={title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        );
      }
      return (
        <div className="w-full h-full bg-[#111827] flex flex-col items-center justify-center text-white/80 gap-1.5">
          <Play className="w-6 h-6" />
          <span className="text-[11px] font-medium">Video</span>
        </div>
      );
    }

    return (
      <iframe
        src={parsed.embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="w-full h-full border-0 bg-[#111827]"
      />
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-[#111827] flex flex-col items-center justify-center text-white/80 gap-2 p-4">
        <Loader2 className="w-5 h-5 animate-spin" />
        {!thumbnailOnly && <span className="text-xs font-medium">Loading video...</span>}
      </div>
    );
  }

  if (error || !resolvedSrc) {
    return (
      <div className="w-full h-full bg-[#F7F8FA] flex flex-col items-center justify-center text-[#6B7280] gap-1.5 p-4 text-center">
        <Film className="w-5 h-5 text-[#315E9B]" />
        {!thumbnailOnly && <span className="text-xs">Unable to load video preview</span>}
      </div>
    );
  }

  return (
    <video
      src={resolvedSrc}
      controls={thumbnailOnly ? false : controls}
      autoPlay={thumbnailOnly ? false : autoPlay}
      muted={thumbnailOnly ? true : muted}
      loop={loop}
      playsInline={playsInline}
      preload="metadata"
      className={className}
    />
  );
};
