import React from 'react';
import { Building2, MapPin, Calendar } from 'lucide-react';
import { ExperienceItem } from '../types/portfolio';

interface ExperienceSectionProps {
  experiences: ExperienceItem[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences }) => {
  return (
    <section id="experience" className="bg-white border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-24">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#315E9B] mb-2">
            Career Timeline
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#202124] tracking-tight mb-4">
            Professional Experience
          </h2>
          <p className="text-base text-[#6B7280] leading-relaxed">
            Approximately 10 years of commercial graphic design, prepress engineering, customized
            merchandise artwork, and print production execution across UAE and Bangladesh.
          </p>
        </div>

        <div className="relative space-y-8">
          {/* Subtle vertical timeline rule on desktop */}
          <div
            className="hidden md:block absolute left-6 top-6 bottom-6 w-px bg-[#E5E7EB]"
            aria-hidden="true"
          />

          {experiences.map((exp, idx) => (
            <div key={exp.id} className="relative md:pl-16">
              {/* Timeline marker */}
              <div
                className="hidden md:flex absolute left-3 top-7 w-6 h-6 rounded-full bg-white border-2 border-[#315E9B] items-center justify-center text-[11px] font-semibold text-[#315E9B] tabular-nums"
                aria-hidden="true"
              >
                {String(idx + 1).padStart(2, '0')}
              </div>

              <article className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 hover:border-[#315E9B]/40 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6 mb-6 border-b border-[#E5E7EB]">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-[#315E9B] mb-1.5">
                      <Building2 className="w-4 h-4" />
                      <span className="tracking-wide uppercase">{exp.companyName}</span>
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-[#202124]">
                      {exp.position}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280] tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#315E9B]" />
                      {exp.location}
                    </span>
                    <span aria-hidden="true" className="text-[#E5E7EB]">
                      |
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#202124]">
                      <Calendar className="w-4 h-4 text-[#315E9B]" />
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold tracking-wider uppercase text-[#6B7280] mb-4">
                    Key Responsibilities &amp; Production Scope
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {exp.responsibilities.map((item, rIdx) => (
                      <li
                        key={rIdx}
                        className="flex items-start gap-3 text-sm text-[#202124]/85 leading-relaxed"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#315E9B] mt-2 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
