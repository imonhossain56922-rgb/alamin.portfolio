import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Briefcase, UserCheck } from 'lucide-react';
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { ProfileData } from '../types/portfolio';
import { PROFILE_PHOTO_PATH } from '../data/defaultData';

interface AboutSectionProps {
  profile: ProfileData;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  const imageSrc = profile.aboutImageUrl || profile.profileImageUrl || PROFILE_PHOTO_PATH;
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

  // Entry scroll: Home -> About Me (Top-to-Down blur reveal while fixed in position)
  const { scrollYProgress: entryProgress } = useScroll({
    target: sectionRef,
    offset: ['start 85%', 'start 18%'],
  });

  const entryHoldY = useTransform(entryProgress, [0, 1], [-90, 0]);
  const entryOpacity = useTransform(entryProgress, [0, 0.25, 0.85], [0.08, 0.72, 1]);
  const entryScale = useTransform(entryProgress, [0, 1], [1.03, 1]);
  const entryClearTopStop = useTransform(entryProgress, [0.06, 0.92], [-25, 105]);
  const entryBlurBottomFeather = useTransform(entryProgress, [0.06, 0.92], [3, 133]);
  const entryBlurLayerOpacity = useTransform(entryProgress, [0, 0.78, 1], [1, 0.85, 0]);
  const entryBlurMaskImage = useMotionTemplate`linear-gradient(to bottom, rgba(0, 0, 0, 0) ${entryClearTopStop}%, rgba(0, 0, 0, 1) ${entryBlurBottomFeather}%)`;

  // Exit scroll: About Me -> Experience (Down-to-Top blur while fixed in position)
  const { scrollYProgress: exitProgress } = useScroll({
    target: sectionRef,
    offset: ['45% start', 'end start'],
  });

  const exitHoldY = useTransform(exitProgress, [0, 0.85], [0, 160]);
  const exitBlurBottomStop = useTransform(exitProgress, [0.05, 0.72], [-25, 102]);
  const exitBlurTopFeather = useTransform(exitProgress, [0.05, 0.72], [3, 130]);
  const exitBlurLayerOpacity = useTransform(exitProgress, [0, 0.1], [0, 1]);
  const exitBlurMaskImage = useMotionTemplate`linear-gradient(to top, rgba(0, 0, 0, 1) ${exitBlurBottomStop}%, rgba(0, 0, 0, 0) ${exitBlurTopFeather}%)`;
  const exitOpacity = useTransform(exitProgress, [0.42, 0.82], [1, 0]);
  const exitScale = useTransform(exitProgress, [0.05, 0.82], [1, 1.03]);

  const paragraphs = profile.biography
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative bg-[#F7F8FA] border-b border-[#E5E7EB]"
    >
      <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Borderless Portrait with Fixed-Position Entry (Top-to-Down) & Exit (Down-to-Top) Blur */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <motion.div
              style={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: isDesktop ? entryHoldY : 0,
                      opacity: entryOpacity,
                      scale: entryScale,
                    }
              }
              className="will-change-transform"
            >
              <motion.div
                style={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: isDesktop ? exitHoldY : 0,
                        opacity: exitOpacity,
                        scale: exitScale,
                      }
                }
                className="will-change-transform"
              >
                <div className="relative w-full aspect-[4/5] overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={`Portrait of ${profile.fullName}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />

                  {/* Entry top-to-down blur reveal overlay */}
                  {!prefersReducedMotion && (
                    <motion.img
                      src={imageSrc}
                      alt=""
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      style={{
                        opacity: entryBlurLayerOpacity,
                        maskImage: entryBlurMaskImage,
                        WebkitMaskImage: entryBlurMaskImage,
                      }}
                      className="pointer-events-none absolute inset-0 w-full h-full object-cover object-top blur-[18px] scale-[1.04]"
                    />
                  )}

                  {/* Exit down-to-top blur overlay when scrolling into Experience */}
                  {!prefersReducedMotion && (
                    <motion.img
                      src={imageSrc}
                      alt=""
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      style={{
                        opacity: exitBlurLayerOpacity,
                        maskImage: exitBlurMaskImage,
                        WebkitMaskImage: exitBlurMaskImage,
                      }}
                      className="pointer-events-none absolute inset-0 w-full h-full object-cover object-top blur-[18px] scale-[1.04]"
                    />
                  )}
                </div>

                <div className="pt-3 flex items-center justify-between text-xs text-[#6B7280]">
                  <span className="font-medium text-[#202124]">{profile.fullName}</span>
                  <span>{profile.location}</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column: Editorial Corporate Biography */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#315E9B] mb-2">
              Profile Overview
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#202124] tracking-tight mb-6">
              About Me
            </h2>

            {/* Structured Professional Facts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl bg-white border border-[#E5E7EB] mb-8">
              <div className="flex items-start gap-3">
                <UserCheck className="w-4 h-4 text-[#315E9B] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#6B7280]">Full Name</p>
                  <p className="text-sm font-semibold text-[#202124]">{profile.fullName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="w-4 h-4 text-[#315E9B] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#6B7280]">Professional Title</p>
                  <p className="text-sm font-semibold text-[#202124]">{profile.professionalTitle}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#315E9B] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#6B7280]">Location</p>
                  <p className="text-sm font-semibold text-[#202124]">{profile.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="w-4 h-4 text-[#315E9B] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#6B7280]">Experience</p>
                  <p className="text-sm font-semibold text-[#202124]">{profile.experience}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-[15px] md:text-base text-[#6B7280] leading-[1.75]">
              {paragraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
