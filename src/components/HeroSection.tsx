import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { ProfileData } from '../types/portfolio';
import { PROFILE_PHOTO_PATH } from '../data/defaultData';

interface HeroSectionProps {
  profile: ProfileData;
  onExploreWork: () => void;
  onContact: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  onExploreWork,
  onContact,
}) => {
  const imageSrc =
    profile.profileImageUrl && profile.profileImageUrl !== PROFILE_PHOTO_PATH
      ? profile.profileImageUrl
      : '';
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 64px', 'end start'],
  });

  // Keep the portrait fixed in viewport position while scrolling out toward About Me (Desktop)
  const desktopHoldY = useTransform(scrollYProgress, [0, 0.72], [0, 220]);
  // Directional down-to-top blur sweep as user scrolls down from Home toward About Me
  const blurBottomStop = useTransform(scrollYProgress, [0.04, 0.68], [-25, 102]);
  const blurTopFeather = useTransform(scrollYProgress, [0.04, 0.68], [3, 130]);
  const blurLayerOpacity = useTransform(scrollYProgress, [0, 0.08], [0, 1]);
  const blurMaskImage = useMotionTemplate`linear-gradient(to top, rgba(0, 0, 0, 1) ${blurBottomStop}%, rgba(0, 0, 0, 0) ${blurTopFeather}%)`;
  const portraitOpacity = useTransform(scrollYProgress, [0.36, 0.76], [1, 0]);
  const portraitScale = useTransform(scrollYProgress, [0.04, 0.76], [1, 1.03]);

  const specialtyText =
    profile.specialtyLine ||
    'Graphic Design | Advertising | Print Production | DTF & UV Printing | 3D Exhibition Design';

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative bg-white border-b border-[#E5E7EB]"
    >
      {/* Mobile-Only View (< 768px): Full-bleed profile image directly below navbar with bottom 50% blurred + text overlay */}
      <div className="md:hidden">
        <div className="relative w-full overflow-hidden bg-white">
          {/* Background Portrait Image (only rendered once uploaded in Admin Panel) */}
          {imageSrc && (
            <motion.div
              style={prefersReducedMotion ? undefined : { opacity: portraitOpacity }}
              className="absolute inset-0 pointer-events-none"
            >
              <img
                src={imageSrc}
                alt={`${profile.fullName} — ${profile.professionalTitle}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />

              {/* Bottom 50% permanent blur layer */}
              <div
                style={{
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 36%, rgba(0,0,0,1) 49%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, rgba(0,0,0,0) 36%, rgba(0,0,0,1) 49%)',
                }}
                className="absolute inset-0 overflow-hidden"
              >
                <img
                  src={imageSrc}
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top blur-[20px] scale-[1.06]"
                />
              </div>

              {/* Scroll-linked down-to-top exit blur when scrolling toward About Me */}
              {!prefersReducedMotion && (
                <motion.img
                  src={imageSrc}
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  style={{
                    opacity: blurLayerOpacity,
                    maskImage: blurMaskImage,
                    WebkitMaskImage: blurMaskImage,
                  }}
                  className="absolute inset-0 w-full h-full object-cover object-top blur-[20px] scale-[1.06]"
                />
              )}

              {/* Soft white frosted veil over the blurred bottom 50% for crisp text legibility */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(255,255,255,0) 35%, rgba(255,255,255,0.88) 49%, rgba(255,255,255,0.95) 75%, rgba(255,255,255,0.99) 100%)',
                }}
              />
            </motion.div>
          )}

          {/* Top 50% shows clear portrait when uploaded; text starts cleanly inside the blurred bottom 50% area */}
          <div className={`relative z-10 px-6 pb-10 ${imageSrc ? 'pt-[370px]' : 'pt-12'}`}>
            <p className="text-sm font-semibold tracking-wide text-[#315E9B] mb-2">
              Hello, I&apos;m {profile.fullName}
            </p>

            <h1 className="font-display text-[1.75rem] font-bold tracking-tight text-[#202124] leading-[1.18] mb-3">
              {profile.headline}
            </h1>

            <p className="text-base font-medium text-[#202124]/90 mb-3">
              {profile.professionalTitle}
            </p>

            <p className="text-sm text-[#202124]/80 leading-[1.65] mb-4">
              {profile.supportingDescription}
            </p>

            <p className="text-xs font-medium text-[#6B7280] border-t border-b border-[#202124]/15 py-3 mb-6">
              {specialtyText}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onExploreWork}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Explore My Work</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onContact}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#202124] bg-white/90 hover:bg-white border border-[#E5E7EB] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Mail className="w-4 h-4 text-[#315E9B]" />
                <span>Contact Me</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Key Credentials Strip */}
        <div className="px-6 py-8 border-t border-[#E5E7EB] grid grid-cols-2 gap-6 bg-white">
          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-1">Experience</p>
            <p className="text-sm font-semibold text-[#202124]">{profile.experience}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-1">Location</p>
            <p className="text-sm font-semibold text-[#202124]">{profile.location}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-1">Current Role</p>
            <p className="text-sm font-semibold text-[#202124]">The Merchlist, UAE</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-1">Previous Tenure</p>
            <p className="text-sm font-semibold text-[#202124]">PRAN-RFL Group (2017–2024)</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-1">Nationality</p>
            <p className="text-sm font-semibold text-[#202124]">Bangladesh</p>
          </div>
        </div>
      </div>

      {/* Tablet & Desktop View (>= 768px): Completely Unchanged */}
      <div className="hidden md:block max-w-[1200px] mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-stretch">
          {/* Left Column: Professional Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <p className="text-sm font-semibold tracking-wide text-[#315E9B] mb-3">
              Hello, I&apos;m {profile.fullName}
            </p>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-[#202124] leading-[1.15] mb-4">
              {profile.headline}
            </h1>

            <p className="text-lg font-medium text-[#202124]/85 mb-4">
              {profile.professionalTitle}
            </p>

            <p className="text-base text-[#6B7280] leading-[1.7] max-w-2xl mb-6">
              {profile.supportingDescription}
            </p>

            <p className="text-xs sm:text-sm font-medium text-[#6B7280] border-t border-b border-[#E5E7EB] py-3.5 mb-8">
              {specialtyText}
            </p>

            <div className="flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={onExploreWork}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Explore My Work</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onContact}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#202124] bg-white hover:bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Mail className="w-4 h-4 text-[#315E9B]" />
                <span>Contact Me</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Borderless Corporate Portrait (rendered once uploaded in Admin Panel) */}
          {imageSrc && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex items-start"
            >
              <motion.div
                style={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: isDesktop ? desktopHoldY : 0,
                        opacity: portraitOpacity,
                        scale: portraitScale,
                      }
                }
                className="relative w-full aspect-[4/5] overflow-hidden will-change-transform"
              >
                <img
                  src={imageSrc}
                  alt={`${profile.fullName} — ${profile.professionalTitle}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />

                {!prefersReducedMotion && (
                  <motion.img
                    src={imageSrc}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    style={{
                      opacity: blurLayerOpacity,
                      maskImage: blurMaskImage,
                      WebkitMaskImage: blurMaskImage,
                    }}
                    className="pointer-events-none absolute inset-0 w-full h-full object-cover object-top blur-[18px] scale-[1.04]"
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Full-Width Key Credentials Strip Below Hero Split */}
        <div className="mt-14 pt-8 border-t border-[#E5E7EB] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1fr_1.2fr_1fr_1.35fr_0.75fr] gap-5">
          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-1">Experience</p>
            <p className="text-base font-semibold text-[#202124]">{profile.experience}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-1">Location</p>
            <p className="text-base font-semibold text-[#202124]">{profile.location}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-1">Current Role</p>
            <p className="text-base font-semibold text-[#202124]">The Merchlist, UAE</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-1">Previous Tenure</p>
            <p className="text-base font-semibold text-[#202124]">PRAN-RFL Group (2017–2024)</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-1">Nationality</p>
            <p className="text-base font-semibold text-[#202124]">Bangladesh</p>
          </div>
        </div>
      </div>
    </section>
  );
};
