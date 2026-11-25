import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ProjectPlaceholderVisualProps {
  categoryName: string;
  title?: string;
  compact?: boolean;
}

export const ProjectPlaceholderVisual: React.FC<ProjectPlaceholderVisualProps> = ({
  categoryName,
  title,
  compact = false,
}) => {
  return (
    <div className="relative w-full h-full bg-[#F7F8FA] flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      {/* Subtle architectural prepress registration grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#E5E7EB" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Prepress crop marks */}
      <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-[#315E9B]/40" />
      <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-[#315E9B]/40" />
      <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-[#315E9B]/40" />
      <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-[#315E9B]/40" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-xs">
        <div className="w-11 h-11 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#315E9B] mb-3 shadow-xs">
          <ImageIcon className="w-5 h-5" />
        </div>
        <p className="text-xs font-medium text-[#315E9B] tracking-wide mb-1">
          {categoryName}
        </p>
        {!compact && title && (
          <p className="text-sm font-medium text-[#202124] mb-1.5 line-clamp-2">{title}</p>
        )}
        <p className="text-xs text-[#6B7280] leading-relaxed">
          Placeholder Visual Slot · Replace with actual artwork via Admin CMS
        </p>
      </div>
    </div>
  );
};
