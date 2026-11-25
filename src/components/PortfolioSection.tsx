import React, { useMemo, useState } from 'react';
import { ArrowUpRight, FolderOpen } from 'lucide-react';
import { CategoryItem, ProjectItem } from '../types/portfolio';
import { placeholderProjects } from '../data/defaultData';
import { ProjectPlaceholderVisual } from './ProjectPlaceholderVisual';
import { ProjectModal } from './ProjectModal';

interface PortfolioSectionProps {
  categories: CategoryItem[];
  projects: ProjectItem[];
  hasFirestoreProjects: boolean;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  categories,
  projects,
  hasFirestoreProjects,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  // Use real Firestore projects when available; otherwise show transparent placeholder slots
  const displayProjects = useMemo(() => {
    if (hasFirestoreProjects || projects.length > 0) {
      return projects;
    }
    return placeholderProjects;
  }, [projects, hasFirestoreProjects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return displayProjects;
    return displayProjects.filter(
      (p) => p.categoryId === selectedCategory || p.categoryName === selectedCategory
    );
  }, [displayProjects, selectedCategory]);

  return (
    <section id="portfolio" className="bg-white border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-24">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#315E9B] mb-2">
              Selected Work &amp; Production Showcase
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#202124] tracking-tight mb-3">
              Portfolio Gallery
            </h2>
            <p className="text-base text-[#6B7280] leading-relaxed">
              Curated commercial design, customized merchandise, prepress production, and 3D
              exhibition visualization across specialized print disciplines.
            </p>
          </div>

          {!hasFirestoreProjects && (
            <p className="text-xs text-[#6B7280] bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3.5 py-2 self-start lg:self-auto">
              Showing placeholder gallery slots until real project photos are uploaded in Admin CMS.
            </p>
          )}
        </div>

        {/* Interactive Category Filter Buttons */}
        <div
          className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-[#E5E7EB]"
          role="tablist"
          aria-label="Portfolio categories"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#315E9B] text-white'
                : 'bg-[#F7F8FA] text-[#6B7280] hover:text-[#202124] border border-[#E5E7EB]'
            }`}
          >
            All Categories
          </button>

          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#315E9B] text-white'
                    : 'bg-[#F7F8FA] text-[#6B7280] hover:text-[#202124] border border-[#E5E7EB]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Portfolio Grid */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#315E9B] mx-auto mb-3">
              <FolderOpen className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#202124] mb-1.5">
              No Published Projects in This Category Yet
            </h3>
            <p className="text-sm text-[#6B7280] max-w-md mx-auto mb-5">
              Projects assigned to this category will appear automatically once published from the
              Admin Dashboard.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 text-xs font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg transition-colors cursor-pointer"
            >
              View All Categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {filteredProjects.map((project, index) => {
              const primaryImg = project.coverImageUrl || project.galleryImages?.[0] || '';
              const isFeature = index === 0 && filteredProjects.length >= 3;

              return (
                <article
                  key={project.id}
                  onClick={() => setActiveProject(project)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveProject(project);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${project.title}`}
                  className={`group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:border-[#315E9B]/50 hover:shadow-md transition-all cursor-pointer flex flex-col ${
                    isFeature ? 'md:col-span-2 lg:grid lg:grid-cols-12' : ''
                  }`}
                >
                  {/* Thumbnail Container */}
                  <div
                    className={`relative overflow-hidden bg-[#F7F8FA] ${
                      isFeature
                        ? 'lg:col-span-7 aspect-[16/10] lg:aspect-auto lg:min-h-[340px]'
                        : 'aspect-[4/3]'
                    }`}
                  >
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={project.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <ProjectPlaceholderVisual categoryName={project.categoryName} compact />
                    )}
                  </div>

                  {/* Card Details (Zero-pill clean unboxed metadata) */}
                  <div
                    className={`p-6 md:p-7 flex flex-col justify-between ${
                      isFeature ? 'lg:col-span-5' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 text-xs text-[#6B7280] mb-2">
                        <span className="font-medium text-[#315E9B] truncate">
                          {project.categoryName}
                        </span>
                        {project.completionDate && (
                          <span className="shrink-0 tabular-nums">{project.completionDate}</span>
                        )}
                      </div>

                      <h3 className="font-display text-lg md:text-xl font-bold text-[#202124] group-hover:text-[#315E9B] transition-colors mb-2.5">
                        {project.title}
                      </h3>

                      <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-3 mb-5">
                        {project.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
                      <p className="text-xs text-[#6B7280] truncate">
                        {project.printingTechnology ||
                          project.softwareUsed?.slice(0, 2).join(' · ') ||
                          'Design & Production'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#315E9B] whitespace-nowrap shrink-0">
                        <span>View Project</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
    </section>
  );
};
