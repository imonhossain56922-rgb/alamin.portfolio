import React from 'react';
import {
  Award,
  Box,
  CheckCircle,
  CheckSquare,
  Compass,
  Crop,
  Crosshair,
  Droplet,
  FileCheck,
  Frame,
  Grid,
  Layers,
  Layout,
  Megaphone,
  Monitor,
  Package,
  Palette,
  PenTool,
  Printer,
  Scissors,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SkillCategory, SkillItem, SoftwareItem } from '../types/portfolio';
import { SoftwareLogo } from './SoftwareLogo';

interface ExpertiseSectionProps {
  skills: SkillItem[];
  software: SoftwareItem[];
}

const SKILL_CATEGORIES: {
  title: SkillCategory;
  subtitle: string;
}[] = [
  {
    title: 'Graphic Design',
    subtitle: 'Visual communication, commercial campaigns, and promotional concepts',
  },
  {
    title: 'Printing Technology',
    subtitle: 'Direct-to-film, UV transfer, offset, screen, and specialty decoration',
  },
  {
    title: 'Print Production',
    subtitle: 'Prepress engineering, CMYK color separation, and press-ready setup',
  },
  {
    title: '3D Design',
    subtitle: 'Spatial booth layouts, exhibition stands, and visual renderings',
  },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  PenTool,
  Megaphone,
  Award,
  Package,
  Monitor,
  Printer,
  Layers,
  Sparkles,
  Grid,
  Frame,
  Scissors,
  Crosshair,
  FileCheck,
  Sliders,
  CheckSquare,
  Palette,
  Droplet,
  Crop,
  Box,
  Layout,
  Compass,
  CheckCircle,
};

export const ExpertiseSection: React.FC<ExpertiseSectionProps> = ({ skills, software }) => {
  return (
    <section id="expertise" className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-24 space-y-20">
        {/* Core Skills & Professional Expertise */}
        <div>
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#315E9B] mb-2">
              Technical &amp; Creative Capabilities
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#202124] tracking-tight mb-4">
              Core Skills &amp; Professional Expertise
            </h2>
            <p className="text-base text-[#6B7280] leading-relaxed">
              Bridging creative visual design with commercial print manufacturing standards and
              3D exhibition spatial planning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SKILL_CATEGORIES.map((group) => {
              const groupSkills = skills.filter((s) => s.category === group.title);
              return (
                <div
                  key={group.title}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-7 hover:border-[#315E9B]/40 transition-colors"
                >
                  <div className="pb-4 mb-5 border-b border-[#E5E7EB]">
                    <h3 className="font-display text-lg font-bold text-[#202124] mb-1">
                      {group.title}
                    </h3>
                    <p className="text-xs text-[#6B7280]">{group.subtitle}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupSkills.map((skill) => {
                      const IconComponent = ICON_MAP[skill.icon] || CheckCircle;
                      return (
                        <div
                          key={skill.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]/80"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#315E9B] shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-[#202124] leading-snug">
                            {skill.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Software & Tools */}
        <div>
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#315E9B] mb-2">
              Production Toolset
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#202124] tracking-tight mb-3">
              Software &amp; Tools
            </h2>
            <p className="text-sm md:text-base text-[#6B7280]">
              Industry-standard design, motion, 3D modeling, and commercial documentation software.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {software.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col items-center text-center hover:border-[#315E9B]/50 hover:-translate-y-0.5 transition-all"
              >
                <div className="mb-3.5">
                  <SoftwareLogo software={item} size="md" />
                </div>
                <p className="text-sm font-semibold text-[#202124] leading-snug">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
