import React, { useState } from 'react';
import { Download, Menu, X } from 'lucide-react';

interface NavbarProps {
  brandName: string;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onDownloadCv: () => void;
  onDownloadCoverLetter: () => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'contact', label: 'Contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  brandName,
  activeSection,
  onNavigate,
  onDownloadCv,
  onDownloadCoverLetter,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-6 h-16 md:h-18 flex items-center justify-between gap-4 xl:gap-8">
        {/* Zone 1: Brand Mark (Single-line, clean typography) */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('home');
          }}
          className="font-display text-lg font-bold tracking-tight text-[#202124] hover:text-[#315E9B] transition-colors whitespace-nowrap shrink-0"
        >
          {brandName}
        </a>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7" aria-label="Primary Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.id);
                }}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#315E9B]'
                    : 'text-[#6B7280] hover:text-[#202124]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-[#315E9B] rounded-full"
                    aria-hidden="true"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Download CV & Download Cover Letter Actions + Mobile Menu Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onDownloadCv}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs xl:text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CV</span>
          </button>

          <button
            type="button"
            onClick={onDownloadCoverLetter}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs xl:text-sm font-medium text-[#202124] bg-[#F7F8FA] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#315E9B]" />
            <span>Download Cover Letter</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden w-10 h-10 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#202124] hover:bg-[#F7F8FA] transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E5E7EB] bg-white px-6 py-4">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.id);
                  }}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F7F8FA] text-[#315E9B]'
                      : 'text-[#6B7280] hover:text-[#202124] hover:bg-[#F7F8FA]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <div className="pt-3 border-t border-[#E5E7EB] sm:hidden space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onDownloadCv();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download CV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onDownloadCoverLetter();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#202124] bg-[#F7F8FA] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB] rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 text-[#315E9B]" />
                <span>Download Cover Letter</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
