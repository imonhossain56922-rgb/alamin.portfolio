import React from 'react';
import { SoftwareItem } from '../types/portfolio';

interface SoftwareLogoProps {
  software: SoftwareItem;
  size?: 'sm' | 'md';
}

export const SoftwareLogo: React.FC<SoftwareLogoProps> = ({ software, size = 'md' }) => {
  const [imgError, setImgError] = React.useState(false);
  const dim = size === 'sm' ? 'w-9 h-9 text-xs' : 'w-12 h-12 text-sm';

  if (software.iconUrl && !imgError) {
    return (
      <div className={`${dim} flex items-center justify-center overflow-hidden shrink-0`}>
        <img
          src={software.iconUrl}
          alt={`${software.name} logo`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-8 h-8 object-contain"
        />
      </div>
    );
  }

  const lower = software.name.toLowerCase();

  // Official-inspired crisp SVG software tiles
  if (lower.includes('photoshop')) {
    return (
      <svg
        viewBox="0 0 48 48"
        className={`${dim} rounded-xl shrink-0`}
        aria-label="Adobe Photoshop icon"
      >
        <rect width="48" height="48" rx="10" fill="#001E36" />
        <rect x="2" y="2" width="44" height="44" rx="8" fill="none" stroke="#31A8FF" strokeWidth="1.5" strokeOpacity="0.35" />
        <text
          x="24"
          y="30"
          textAnchor="middle"
          fill="#31A8FF"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontWeight="700"
          fontSize="19"
        >
          Ps
        </text>
      </svg>
    );
  }

  if (lower.includes('illustrator')) {
    return (
      <svg
        viewBox="0 0 48 48"
        className={`${dim} rounded-xl shrink-0`}
        aria-label="Adobe Illustrator icon"
      >
        <rect width="48" height="48" rx="10" fill="#330000" />
        <rect x="2" y="2" width="44" height="44" rx="8" fill="none" stroke="#FF9A00" strokeWidth="1.5" strokeOpacity="0.35" />
        <text
          x="24"
          y="30"
          textAnchor="middle"
          fill="#FF9A00"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontWeight="700"
          fontSize="19"
        >
          Ai
        </text>
      </svg>
    );
  }

  if (lower.includes('premiere')) {
    return (
      <svg
        viewBox="0 0 48 48"
        className={`${dim} rounded-xl shrink-0`}
        aria-label="Adobe Premiere Pro icon"
      >
        <rect width="48" height="48" rx="10" fill="#00005B" />
        <rect x="2" y="2" width="44" height="44" rx="8" fill="none" stroke="#9999FF" strokeWidth="1.5" strokeOpacity="0.35" />
        <text
          x="24"
          y="30"
          textAnchor="middle"
          fill="#9999FF"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontWeight="700"
          fontSize="19"
        >
          Pr
        </text>
      </svg>
    );
  }

  if (lower.includes('after effects')) {
    return (
      <svg
        viewBox="0 0 48 48"
        className={`${dim} rounded-xl shrink-0`}
        aria-label="Adobe After Effects icon"
      >
        <rect width="48" height="48" rx="10" fill="#00005B" />
        <rect x="2" y="2" width="44" height="44" rx="8" fill="none" stroke="#9999FF" strokeWidth="1.5" strokeOpacity="0.35" />
        <text
          x="24"
          y="30"
          textAnchor="middle"
          fill="#9999FF"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontWeight="700"
          fontSize="19"
        >
          Ae
        </text>
      </svg>
    );
  }

  if (lower.includes('sketchup')) {
    return (
      <svg
        viewBox="0 0 48 48"
        className={`${dim} rounded-xl shrink-0`}
        aria-label="SketchUp Pro icon"
      >
        <rect width="48" height="48" rx="10" fill="#005F9E" />
        <polygon points="24,10 38,18 24,25 10,18" fill="#FFFFFF" fillOpacity="0.95" />
        <polygon points="10,21 23,28 23,39 10,32" fill="#FFFFFF" fillOpacity="0.72" />
        <polygon points="38,21 25,28 25,39 38,32" fill="#FFFFFF" fillOpacity="0.85" />
      </svg>
    );
  }

  if (lower.includes('office') || lower.includes('microsoft')) {
    return (
      <svg
        viewBox="0 0 48 48"
        className={`${dim} rounded-xl shrink-0`}
        aria-label="Microsoft Office icon"
      >
        <rect width="48" height="48" rx="10" fill="#F7F8FA" stroke="#E5E7EB" />
        <path
          d="M14 15.5L27 11l7 2.5v21L27 37l-13-4.5 13 1.5V16.5L19 19v11.5l-5-1.5V15.5z"
          fill="#D83B01"
        />
      </svg>
    );
  }

  const code =
    software.shortCode ||
    software.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();

  return (
    <div
      className={`${dim} rounded-xl flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: software.brandColor || '#315E9B' }}
    >
      {code}
    </div>
  );
};
