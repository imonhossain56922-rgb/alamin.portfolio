import React from 'react';
import { Lock } from 'lucide-react';
import { ProfileData, SiteSettings } from '../types/portfolio';

interface FooterProps {
  profile: ProfileData;
  settings: SiteSettings;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  profile,
  settings,
  onNavigate,
  onOpenAdmin,
}) => {
  const year = new Date().getFullYear();

  const formatUrl = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return '';
    return trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
  };

  return (
    <footer className="bg-white border-t border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-[#E5E7EB]">
          <div>
            <p className="font-display text-lg font-bold text-[#202124]">{profile.fullName}</p>
            <p className="text-sm text-[#6B7280] mt-0.5">
              {settings.footerText || `${profile.professionalTitle} · ${profile.location}`}
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-sm text-[#6B7280]" aria-label="Footer Navigation">
            {['home', 'about', 'experience', 'portfolio', 'contact'].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(id);
                }}
                className="capitalize hover:text-[#315E9B] transition-colors"
              >
                {id}
              </a>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-[#202124]">
            {profile.showLinkedin !== false &&
              (profile.linkedin ? (
                <a
                  href={formatUrl(profile.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#315E9B] transition-colors"
                >
                  LinkedIn
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#315E9B] transition-colors cursor-pointer"
                >
                  LinkedIn
                </button>
              ))}

            {profile.showBehance !== false &&
              (profile.behance ? (
                <a
                  href={formatUrl(profile.behance)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#315E9B] transition-colors"
                >
                  Behance
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#315E9B] transition-colors cursor-pointer"
                >
                  Behance
                </button>
              ))}

            {profile.showEmail !== false &&
              (profile.email ? (
                <a
                  href={`mailto:${profile.email}`}
                  className="hover:text-[#315E9B] transition-colors"
                >
                  Email
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#315E9B] transition-colors cursor-pointer"
                >
                  Email
                </button>
              ))}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
          <p>
            © {year} {profile.fullName}. All Rights Reserved.
          </p>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 text-[#6B7280] hover:text-[#315E9B] transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
