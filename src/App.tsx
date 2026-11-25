import React, { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  defaultCategories,
  defaultExperiences,
  defaultProfile,
  defaultSettings,
  defaultSkills,
  defaultSoftware,
} from './data/defaultData';
import { auth } from './lib/firebase';
import {
  checkIsAdminUser,
  subscribePublicProfile,
  subscribePublicSettings,
  subscribePublishedProjects,
  subscribeVisibleCategories,
  subscribeVisibleExperiences,
  subscribeVisibleSkills,
  subscribeVisibleSoftware,
} from './lib/portfolioService';
import {
  CategoryItem,
  ExperienceItem,
  ProfileData,
  ProjectItem,
  SiteSettings,
  SkillItem,
  SoftwareItem,
} from './types/portfolio';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ExpertiseSection } from './components/ExpertiseSection';
import { PortfolioSection } from './components/PortfolioSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CvModal } from './components/CvModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [activeSection, setActiveSection] = useState('home');
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [coverLetterModalOpen, setCoverLetterModalOpen] = useState(false);

  // Public Firestore-backed state (with non-destructive baseline defaults)
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [profileInDb, setProfileInDb] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [experiences, setExperiences] = useState<ExperienceItem[]>(defaultExperiences);
  const [skills, setSkills] = useState<SkillItem[]>(defaultSkills);
  const [software, setSoftware] = useState<SoftwareItem[]>(defaultSoftware);
  const [categories, setCategories] = useState<CategoryItem[]>(defaultCategories);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [hasFirestoreProjects, setHasFirestoreProjects] = useState(false);

  // Admin Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isAdminRoute = pathname.startsWith('/admin');

  const navigateRoute = useCallback((nextPath: string) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      setPathname(nextPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Subscribe to public portfolio data
  useEffect(() => {
    const u1 = subscribePublicProfile((data, exists) => {
      setProfile(data);
      setProfileInDb(exists);
    });
    const u2 = subscribePublicSettings((data) => {
      setSettings(data);
    });
    const u3 = subscribeVisibleExperiences((items) => setExperiences(items));
    const u4 = subscribeVisibleSkills((items) => setSkills(items));
    const u5 = subscribeVisibleSoftware((items) => setSoftware(items));
    const u6 = subscribeVisibleCategories((items) => setCategories(items));
    const u7 = subscribePublishedProjects((items, fromDb) => {
      setProjects(items);
      setHasFirestoreProjects(fromDb);
    });

    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
      u6();
      u7();
    };
  }, []);

  // Sync dynamic document title & meta description from Firestore settings
  useEffect(() => {
    if (settings.websiteTitle) {
      document.title = isAdminRoute
        ? `Admin CMS | ${settings.websiteTitle}`
        : settings.websiteTitle;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && settings.metaDescription) {
      metaDesc.setAttribute('content', settings.metaDescription);
    }
  }, [settings.websiteTitle, settings.metaDescription, isAdminRoute]);

  // Monitor Firebase Auth state for protected /admin route
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setIsAuthorizedAdmin(false);
        setCheckingAuth(false);
        return;
      }
      setCheckingAuth(true);
      const allowed = await checkIsAdminUser(user.uid, user.email, user.emailVerified);
      setIsAuthorizedAdmin(allowed);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // IntersectionObserver for active nav indicator
  useEffect(() => {
    if (isAdminRoute) return;
    const sectionIds = ['home', 'about', 'experience', 'expertise', 'portfolio', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-35% 0px -55% 0px' }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [isAdminRoute]);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      if (isAdminRoute) {
        navigateRoute('/');
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
        return;
      }
      setActiveSection(sectionId);
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    },
    [isAdminRoute, navigateRoute]
  );

  // Render Protected Admin Route
  if (isAdminRoute) {
    if (!currentUser || !isAuthorizedAdmin || checkingAuth) {
      return (
        <AdminLogin
          currentUser={currentUser}
          isAuthorizedAdmin={isAuthorizedAdmin}
          checkingAuth={checkingAuth}
          onBackToSite={() => navigateRoute('/')}
        />
      );
    }

    return (
      <AdminDashboard
        user={currentUser}
        profile={profile}
        profileInDb={profileInDb}
        settings={settings}
        onBackToSite={() => navigateRoute('/')}
      />
    );
  }

  // Public Portfolio Website
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#202124]">
      <Navbar
        brandName={profile.fullName}
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onDownloadCv={() => setCvModalOpen(true)}
        onDownloadCoverLetter={() => setCoverLetterModalOpen(true)}
      />

      <main className="flex-1">
        <HeroSection
          profile={profile}
          onExploreWork={() => scrollToSection('portfolio')}
          onContact={() => scrollToSection('contact')}
        />

        <AboutSection profile={profile} />

        <ExperienceSection experiences={experiences} />

        <ExpertiseSection skills={skills} software={software} />

        <PortfolioSection
          categories={categories}
          projects={projects}
          hasFirestoreProjects={hasFirestoreProjects}
        />

        <ContactSection profile={profile} />
      </main>

      <Footer
        profile={profile}
        settings={settings}
        onNavigate={scrollToSection}
        onOpenAdmin={() => navigateRoute('/admin')}
      />

      <CvModal
        isOpen={cvModalOpen}
        onClose={() => setCvModalOpen(false)}
        cvUrl={settings.cvUrl}
        cvFileName={settings.cvFileName}
        fullName={profile.fullName}
        onContactClick={() => scrollToSection('contact')}
      />

      <CvModal
        documentType="cover-letter"
        isOpen={coverLetterModalOpen}
        onClose={() => setCoverLetterModalOpen(false)}
        cvUrl={settings.coverLetterUrl || ''}
        cvFileName={settings.coverLetterFileName || 'MD_AL_AMIN_Cover_Letter.pdf'}
        fullName={profile.fullName}
        onContactClick={() => scrollToSection('contact')}
      />
    </div>
  );
}
