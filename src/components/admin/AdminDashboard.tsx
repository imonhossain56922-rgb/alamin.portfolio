import React, { useEffect, useRef, useState } from 'react';
import { signOut, User } from 'firebase/auth';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Database,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  FolderKanban,
  Layers,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Tags,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import {
  deleteCategoryDoc,
  deleteExperienceDoc,
  deleteSkillDoc,
  deleteSoftwareDoc,
  saveCategory,
  saveExperience,
  saveProfile,
  saveSiteSettings,
  saveSkill,
  saveSoftware,
  seedMissingDefaults,
  subscribeAdminCollection,
} from '../../lib/portfolioService';
import {
  CategoryItem,
  ExperienceItem,
  ProfileData,
  ProjectItem,
  SiteSettings,
  SkillCategory,
  SkillItem,
  SoftwareItem,
} from '../../types/portfolio';
import { FileUploader } from './FileUploader';
import { ProjectsManager } from './ProjectsManager';
import { SoftwareLogo } from '../SoftwareLogo';

type AdminTab =
  | 'overview'
  | 'projects'
  | 'profile'
  | 'experience'
  | 'expertise'
  | 'categories'
  | 'settings';

interface AdminDashboardProps {
  user: User;
  profile: ProfileData;
  profileInDb: boolean;
  settings: SiteSettings;
  onBackToSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  profile,
  profileInDb,
  settings,
  onBackToSite,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [software, setSoftware] = useState<SoftwareItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Local editable state for Profile & Settings
  const [profileForm, setProfileForm] = useState<ProfileData>(profile);
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Local forms for Experience / Skill / Software / Category editing & creation
  const [newExp, setNewExp] = useState({
    companyName: '',
    position: 'Graphic Designer',
    location: '',
    startDate: '',
    endDate: 'Present',
    responsibilitiesText: '',
    isVisible: true,
  });
  const [editingExpId, setEditingExpId] = useState<string | null>(null);

  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Graphic Design' as SkillCategory,
    isVisible: true,
  });
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  const [newSoftware, setNewSoftware] = useState({
    name: '',
    shortCode: '',
    brandColor: '#315E9B',
    iconUrl: '',
    isVisible: true,
  });
  const [editingSoftwareId, setEditingSoftwareId] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryVisible, setNewCategoryVisible] = useState(true);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const hasAutoSeededRef = useRef(false);

  useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  useEffect(() => {
    const handleErr = (err: Error) => {
      setToast({ type: 'err', text: err.message });
    };
    const u1 = subscribeAdminCollection<ProjectItem>('projects', setProjects, handleErr);
    const u2 = subscribeAdminCollection<ExperienceItem>('experiences', setExperiences, handleErr);
    const u3 = subscribeAdminCollection<SkillItem>('skills', setSkills, handleErr);
    const u4 = subscribeAdminCollection<SoftwareItem>('software', setSoftware, handleErr);
    const u5 = subscribeAdminCollection<CategoryItem>('categories', setCategories, handleErr);

    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
    };
  }, []);

  // Automatically ensure missing baseline records exist in Firestore so previous data is immediately editable
  useEffect(() => {
    if (hasAutoSeededRef.current) return;
    hasAutoSeededRef.current = true;
    seedMissingDefaults().catch((err) => {
      console.warn('Auto-seed missing defaults skipped:', err);
    });
  }, []);

  const showSuccess = (text: string) => {
    setToast({ type: 'ok', text });
    setTimeout(() => setToast(null), 4000);
  };

  const showError = (err: unknown) => {
    setToast({
      type: 'err',
      text: err instanceof Error ? err.message : 'Operation failed.',
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await saveProfile(profileForm);
      showSuccess('Profile and contact information saved.');
    } catch (err) {
      showError(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await saveSiteSettings(settingsForm);
      showSuccess('CV and website settings updated.');
    } catch (err) {
      showError(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const { createdCount } = await seedMissingDefaults();
      showSuccess(
        createdCount > 0
          ? `Initialized ${createdCount} missing baseline records in Firestore without altering existing data.`
          : 'All baseline collections already exist in Firestore.'
      );
    } catch (err) {
      showError(err);
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.companyName.trim() || !newExp.position.trim()) return;
    try {
      const responsibilities = newExp.responsibilitiesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      await saveExperience(
        {
          companyName: newExp.companyName,
          position: newExp.position,
          location: newExp.location || 'Dubai, UAE',
          startDate: newExp.startDate || '2024',
          endDate: newExp.endDate || 'Present',
          responsibilities,
          displayOrder: editingExpId
            ? experiences.find((x) => x.id === editingExpId)?.displayOrder ?? 1
            : experiences.length + 1,
          isVisible: newExp.isVisible,
        },
        editingExpId || undefined
      );
      setEditingExpId(null);
      setNewExp({
        companyName: '',
        position: 'Graphic Designer',
        location: '',
        startDate: '',
        endDate: 'Present',
        responsibilitiesText: '',
        isVisible: true,
      });
      showSuccess('Experience entry saved.');
    } catch (err) {
      showError(err);
    }
  };

  const handleToggleExperienceVisibility = async (exp: ExperienceItem) => {
    try {
      await saveExperience({ ...exp, isVisible: !exp.isVisible }, exp.id);
      showSuccess(`Experience "${exp.companyName}" ${exp.isVisible ? 'hidden' : 'activated'}.`);
    } catch (err) {
      showError(err);
    }
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;
    try {
      const existing = editingSkillId ? skills.find((s) => s.id === editingSkillId) : undefined;
      await saveSkill(
        {
          name: newSkill.name,
          category: newSkill.category,
          icon: existing?.icon || 'CheckCircle',
          displayOrder: existing ? existing.displayOrder : skills.length + 1,
          isVisible: editingSkillId ? newSkill.isVisible : true,
        },
        editingSkillId || undefined
      );
      setEditingSkillId(null);
      setNewSkill({ name: '', category: newSkill.category, isVisible: true });
      showSuccess(editingSkillId ? 'Skill updated.' : 'Skill added.');
    } catch (err) {
      showError(err);
    }
  };

  const handleToggleSkillVisibility = async (skill: SkillItem) => {
    try {
      await saveSkill({ ...skill, isVisible: !skill.isVisible }, skill.id);
      showSuccess(`Skill "${skill.name}" ${skill.isVisible ? 'hidden' : 'activated'}.`);
    } catch (err) {
      showError(err);
    }
  };

  const handleSaveSoftware = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSoftware.name.trim()) return;
    try {
      const existing = editingSoftwareId
        ? software.find((s) => s.id === editingSoftwareId)
        : undefined;
      await saveSoftware(
        {
          name: newSoftware.name,
          shortCode: newSoftware.shortCode,
          brandColor: newSoftware.brandColor,
          iconUrl: newSoftware.iconUrl,
          displayOrder: existing ? existing.displayOrder : software.length + 1,
          isVisible: editingSoftwareId ? newSoftware.isVisible : true,
        },
        editingSoftwareId || undefined
      );
      setEditingSoftwareId(null);
      setNewSoftware({
        name: '',
        shortCode: '',
        brandColor: '#315E9B',
        iconUrl: '',
        isVisible: true,
      });
      showSuccess(editingSoftwareId ? 'Software tool updated.' : 'Software tool added.');
    } catch (err) {
      showError(err);
    }
  };

  const handleToggleSoftwareVisibility = async (sw: SoftwareItem) => {
    try {
      await saveSoftware({ ...sw, isVisible: !sw.isVisible }, sw.id);
      showSuccess(`Software "${sw.name}" ${sw.isVisible ? 'hidden' : 'activated'}.`);
    } catch (err) {
      showError(err);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const existing = editingCategoryId
        ? categories.find((c) => c.id === editingCategoryId)
        : undefined;
      await saveCategory(
        {
          name: newCategoryName,
          slug: newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          displayOrder: existing ? existing.displayOrder : categories.length + 1,
          isVisible: editingCategoryId ? newCategoryVisible : true,
        },
        editingCategoryId || undefined
      );
      setEditingCategoryId(null);
      setNewCategoryName('');
      setNewCategoryVisible(true);
      showSuccess(editingCategoryId ? 'Category updated.' : 'Category added.');
    } catch (err) {
      showError(err);
    }
  };

  const handleToggleCategoryVisibility = async (cat: CategoryItem) => {
    try {
      await saveCategory({ ...cat, isVisible: !cat.isVisible }, cat.id);
      showSuccess(`Category "${cat.name}" ${cat.isVisible ? 'hidden' : 'activated'}.`);
    } catch (err) {
      showError(err);
    }
  };

  const publishedCount = projects.filter((p) => p.published).length;
  const draftCount = projects.filter((p) => !p.published).length;

  const navTabs: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Portfolio', icon: FolderKanban },
    { id: 'profile', label: 'Profile & Contact', icon: UserIcon },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'expertise', label: 'Skills & Software', icon: Layers },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'settings', label: 'CV & Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1320px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#202124] border border-[#E5E7EB] px-3 py-1.5 rounded-lg cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>
            <h1 className="font-display text-base font-bold text-[#202124] truncate">
              MD AL AMIN · Portfolio CMS
            </h1>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden sm:inline text-xs text-[#6B7280]">{user.email}</span>
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#202124] bg-[#F7F8FA] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB] rounded-lg cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1320px] w-full mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-white border border-[#E5E7EB] rounded-2xl p-3">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#315E9B] text-white'
                      : 'text-[#6B7280] hover:text-[#202124] hover:bg-[#F7F8FA]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Workspace */}
        <main className="lg:col-span-9 space-y-6">
          {toast && (
            <div
              role="status"
              className={`px-4 py-3 rounded-xl border text-xs flex items-center justify-between gap-4 ${
                toast.type === 'ok'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <span className="break-words">{toast.text}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="font-semibold underline shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#202124]">
                  Dashboard Overview
                </h2>
                <p className="text-sm text-[#6B7280]">
                  Real-time summary of your Firestore-backed portfolio content.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                  <p className="text-xs text-[#6B7280] mb-1">Total Portfolio Projects</p>
                  <p className="font-display text-2xl font-bold text-[#202124] tabular-nums">
                    {projects.length}
                  </p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                  <p className="text-xs text-[#6B7280] mb-1">Published Projects</p>
                  <p className="font-display text-2xl font-bold text-[#315E9B] tabular-nums">
                    {publishedCount}
                  </p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                  <p className="text-xs text-[#6B7280] mb-1">Draft Projects</p>
                  <p className="font-display text-2xl font-bold text-[#202124] tabular-nums">
                    {draftCount}
                  </p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                  <p className="text-xs text-[#6B7280] mb-1">Total Categories</p>
                  <p className="font-display text-2xl font-bold text-[#202124] tabular-nums">
                    {categories.length}
                  </p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                  <p className="text-xs text-[#6B7280] mb-1">Profile Information Status</p>
                  <p className="text-sm font-semibold text-[#202124] mt-1">
                    {profileInDb ? 'Synced in Firestore' : 'Using Default Baseline'}
                  </p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                  <p className="text-xs text-[#6B7280] mb-1">Current CV Status</p>
                  <p className="text-sm font-semibold text-[#202124] mt-1">
                    {settings.cvUrl ? 'Published PDF Active' : 'Pending Upload'}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#202124] mb-1">
                    <Database className="w-4 h-4 text-[#315E9B]" />
                    <span>Initialize Missing Baseline Content</span>
                  </div>
                  <p className="text-xs text-[#6B7280] max-w-xl leading-relaxed">
                    Safely writes only missing profile, experience, skill, software, and category
                    records into Firestore. Existing documents are never overwritten or deleted.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSeedDefaults}
                  disabled={seeding}
                  className="px-4 py-2.5 text-xs font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] disabled:opacity-60 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {seeding ? 'Checking...' : 'Sync Missing Defaults'}
                </button>
              </div>
            </div>
          )}

          {/* PORTFOLIO PROJECTS TAB */}
          {activeTab === 'projects' && (
            <ProjectsManager projects={projects} categories={categories} />
          )}

          {/* PROFILE & CONTACT TAB */}
          {activeTab === 'profile' && (
            <form
              onSubmit={handleSaveProfile}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-5"
            >
              <div>
                <h2 className="font-display text-xl font-bold text-[#202124]">
                  Manage Profile &amp; Contact Information
                </h2>
                <p className="text-sm text-[#6B7280]">
                  Changes update the Hero, About Me, Contact, and Footer sections in real time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.professionalTitle}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, professionalTitle: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.location}
                    onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">
                    Experience
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.experience}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, experience: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">
                  Hero Headline
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.headline}
                  onChange={(e) => setProfileForm((p) => ({ ...p, headline: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">
                  Hero Supporting Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={profileForm.supportingDescription}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, supportingDescription: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">
                  About Me Biography
                </label>
                <textarea
                  rows={6}
                  required
                  value={profileForm.biography}
                  onChange={(e) => setProfileForm((p) => ({ ...p, biography: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploader
                  mode="image"
                  folderPath="profile"
                  label="Home Page Image (Hero Section)"
                  currentUrl={profileForm.profileImageUrl}
                  onUploaded={(url) =>
                    setProfileForm((p) => ({ ...p, profileImageUrl: url }))
                  }
                />
                <FileUploader
                  mode="image"
                  folderPath="profile"
                  label="About Me Page Image (About Section)"
                  currentUrl={profileForm.aboutImageUrl || ''}
                  onUploaded={(url) =>
                    setProfileForm((p) => ({ ...p, aboutImageUrl: url }))
                  }
                />
              </div>

              <div className="pt-4 border-t border-[#E5E7EB]">
                <div className="mb-4">
                  <h3 className="font-display text-base font-bold text-[#202124]">
                    Contact &amp; Inquiries Channels
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Set each channel Active to show it on the public Contact &amp; Footer sections,
                    or Inactive to hide it.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email Address */}
                  <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-[#202124]">
                        Email Address
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfileForm((p) => ({
                            ...p,
                            showEmail: p.showEmail === false ? true : false,
                          }))
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                          profileForm.showEmail !== false
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-white border-[#E5E7EB] text-[#6B7280]'
                        }`}
                      >
                        {profileForm.showEmail !== false ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="your.email@domain.com"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-[#202124]">
                        WhatsApp (Phone or wa.me link)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfileForm((p) => ({
                            ...p,
                            showWhatsapp: p.showWhatsapp === false ? true : false,
                          }))
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                          profileForm.showWhatsapp !== false
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-white border-[#E5E7EB] text-[#6B7280]'
                        }`}
                      >
                        {profileForm.showWhatsapp !== false ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={profileForm.whatsapp}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, whatsapp: e.target.value }))
                      }
                      placeholder="+971 50 000 0000"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-[#202124]">
                        LinkedIn Profile URL
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfileForm((p) => ({
                            ...p,
                            showLinkedin: p.showLinkedin === false ? true : false,
                          }))
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                          profileForm.showLinkedin !== false
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-white border-[#E5E7EB] text-[#6B7280]'
                        }`}
                      >
                        {profileForm.showLinkedin !== false ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={profileForm.linkedin}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, linkedin: e.target.value }))
                      }
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg"
                    />
                  </div>

                  {/* Behance */}
                  <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-[#202124]">
                        Behance Portfolio URL
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfileForm((p) => ({
                            ...p,
                            showBehance: p.showBehance === false ? true : false,
                          }))
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                          profileForm.showBehance !== false
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-white border-[#E5E7EB] text-[#6B7280]'
                        }`}
                      >
                        {profileForm.showBehance !== false ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={profileForm.behance}
                      onChange={(e) => setProfileForm((p) => ({ ...p, behance: e.target.value }))}
                      placeholder="https://behance.net/..."
                      className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] disabled:opacity-60 rounded-lg cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile & Contact'}</span>
                </button>
              </div>
            </form>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveExperience}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4"
              >
                <h2 className="font-display text-xl font-bold text-[#202124]">
                  {editingExpId ? 'Edit Experience Entry' : 'Add Career Experience'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Company Name (e.g., THE MERCHLIST)"
                    value={newExp.companyName}
                    onChange={(e) => setNewExp((s) => ({ ...s, companyName: e.target.value }))}
                    className="px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Position (e.g., Graphic Designer)"
                    value={newExp.position}
                    onChange={(e) => setNewExp((s) => ({ ...s, position: e.target.value }))}
                    className="px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g., United Arab Emirates)"
                    value={newExp.location}
                    onChange={(e) => setNewExp((s) => ({ ...s, location: e.target.value }))}
                    className="px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Start Year (2024)"
                      value={newExp.startDate}
                      onChange={(e) => setNewExp((s) => ({ ...s, startDate: e.target.value }))}
                      className="px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="End Year (Present)"
                      value={newExp.endDate}
                      onChange={(e) => setNewExp((s) => ({ ...s, endDate: e.target.value }))}
                      className="px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                    />
                  </div>
                </div>
                <textarea
                  rows={4}
                  placeholder="Responsibilities (one per line)"
                  value={newExp.responsibilitiesText}
                  onChange={(e) =>
                    setNewExp((s) => ({ ...s, responsibilitiesText: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-[#202124] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newExp.isVisible}
                      onChange={(e) =>
                        setNewExp((s) => ({ ...s, isVisible: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#315E9B]"
                    />
                    <span>Visible on Public Site</span>
                  </label>

                  <div className="flex items-center gap-3">
                    {editingExpId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingExpId(null);
                          setNewExp({
                            companyName: '',
                            position: 'Graphic Designer',
                            location: '',
                            startDate: '',
                            endDate: 'Present',
                            responsibilitiesText: '',
                            isVisible: true,
                          });
                        }}
                        className="px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{editingExpId ? 'Update Experience' : 'Add Experience'}</span>
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-3">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex items-start justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#315E9B]">
                        {exp.companyName} ·{' '}
                        <span className={exp.isVisible ? 'text-emerald-700' : 'text-[#6B7280]'}>
                          {exp.isVisible ? 'Active' : 'Hidden'}
                        </span>
                      </p>
                      <h3 className="font-display text-base font-bold text-[#202124]">
                        {exp.position}
                      </h3>
                      <p className="text-xs text-[#6B7280]">
                        {exp.location} · {exp.startDate} – {exp.endDate} (
                        {exp.responsibilities.length} responsibilities)
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleExperienceVisibility(exp)}
                        title={exp.isVisible ? 'Hide from public site' : 'Show on public site'}
                        className="p-2 text-[#6B7280] hover:text-[#315E9B] border border-[#E5E7EB] rounded-lg cursor-pointer"
                      >
                        {exp.isVisible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingExpId(exp.id);
                          setNewExp({
                            companyName: exp.companyName,
                            position: exp.position,
                            location: exp.location,
                            startDate: exp.startDate,
                            endDate: exp.endDate,
                            responsibilitiesText: exp.responsibilities.join('\n'),
                            isVisible: exp.isVisible,
                          });
                        }}
                        className="px-3 py-1.5 text-xs font-medium border border-[#E5E7EB] rounded-lg hover:bg-[#F7F8FA] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteExperienceDoc(exp.id).catch(showError)}
                        className="p-2 text-red-700 border border-[#E5E7EB] rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Delete experience"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SKILLS & SOFTWARE TAB */}
          {activeTab === 'expertise' && (
            <div className="space-y-6">
              {/* Skills */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4">
                <h2 className="font-display text-xl font-bold text-[#202124]">
                  {editingSkillId ? 'Edit Core Skill' : 'Manage Core Skills'}
                </h2>
                <form onSubmit={handleSaveSkill} className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Skill Name (e.g., DTF Printing)"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill((s) => ({ ...s, name: e.target.value }))}
                    className="flex-1 min-w-[200px] px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                  <select
                    value={newSkill.category}
                    onChange={(e) =>
                      setNewSkill((s) => ({ ...s, category: e.target.value as SkillCategory }))
                    }
                    className="px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white"
                  >
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Printing Technology">Printing Technology</option>
                    <option value="Print Production">Print Production</option>
                    <option value="3D Design">3D Design</option>
                  </select>
                  {editingSkillId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSkillId(null);
                        setNewSkill({ name: '', category: 'Graphic Design', isVisible: true });
                      }}
                      className="px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg cursor-pointer"
                  >
                    {editingSkillId ? 'Update Skill' : 'Add Skill'}
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-[#315E9B] truncate">
                          {skill.category} ·{' '}
                          <span className={skill.isVisible ? 'text-emerald-700' : 'text-[#6B7280]'}>
                            {skill.isVisible ? 'Active' : 'Hidden'}
                          </span>
                        </p>
                        <p className="text-sm font-medium text-[#202124] truncate">{skill.name}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSkillVisibility(skill)}
                          className="p-1.5 text-[#6B7280] hover:text-[#315E9B] cursor-pointer"
                          title={skill.isVisible ? 'Hide skill' : 'Show skill'}
                        >
                          {skill.isVisible ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSkillId(skill.id);
                            setNewSkill({
                              name: skill.name,
                              category: skill.category,
                              isVisible: skill.isVisible,
                            });
                          }}
                          className="p-1.5 text-[#6B7280] hover:text-[#315E9B] cursor-pointer"
                          title="Edit skill"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSkillDoc(skill.id).catch(showError)}
                          className="p-1.5 text-[#6B7280] hover:text-red-700 cursor-pointer"
                          title="Remove skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Software */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4">
                <h2 className="font-display text-xl font-bold text-[#202124]">
                  {editingSoftwareId ? 'Edit Software & Tool' : 'Manage Software & Tools'}
                </h2>
                <form onSubmit={handleSaveSoftware} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Software Name (e.g., CorelDRAW)"
                      value={newSoftware.name}
                      onChange={(e) => setNewSoftware((s) => ({ ...s, name: e.target.value }))}
                      className="px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Short Code (e.g., Cd)"
                      value={newSoftware.shortCode}
                      onChange={(e) => setNewSoftware((s) => ({ ...s, shortCode: e.target.value }))}
                      className="px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Brand Hex (#315E9B)"
                      value={newSoftware.brandColor}
                      onChange={(e) =>
                        setNewSoftware((s) => ({ ...s, brandColor: e.target.value }))
                      }
                      className="px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                    />
                  </div>
                  <FileUploader
                    mode="image"
                    folderPath="software"
                    label="Optional Custom Software Icon"
                    currentUrl={newSoftware.iconUrl}
                    onUploaded={(url) => setNewSoftware((s) => ({ ...s, iconUrl: url }))}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg cursor-pointer"
                    >
                      {editingSoftwareId ? 'Update Software Tool' : 'Add Software Tool'}
                    </button>
                    {editingSoftwareId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSoftwareId(null);
                          setNewSoftware({
                            name: '',
                            shortCode: '',
                            brandColor: '#315E9B',
                            iconUrl: '',
                            isVisible: true,
                          });
                        }}
                        className="px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {software.map((sw) => (
                    <div
                      key={sw.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <SoftwareLogo software={sw} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#202124] truncate">{sw.name}</p>
                          <p className="text-[11px] text-[#6B7280]">
                            {sw.isVisible ? 'Active' : 'Hidden'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSoftwareVisibility(sw)}
                          className="p-1.5 text-[#6B7280] hover:text-[#315E9B] cursor-pointer"
                          title={sw.isVisible ? 'Hide software' : 'Show software'}
                        >
                          {sw.isVisible ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSoftwareId(sw.id);
                            setNewSoftware({
                              name: sw.name,
                              shortCode: sw.shortCode || '',
                              brandColor: sw.brandColor || '#315E9B',
                              iconUrl: sw.iconUrl || '',
                              isVisible: sw.isVisible,
                            });
                          }}
                          className="p-1.5 text-[#6B7280] hover:text-[#315E9B] cursor-pointer"
                          title="Edit software"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSoftwareDoc(sw.id).catch(showError)}
                          className="p-1.5 text-[#6B7280] hover:text-red-700 cursor-pointer"
                          title="Remove software"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-5">
              <h2 className="font-display text-xl font-bold text-[#202124]">
                {editingCategoryId ? 'Edit Portfolio Category' : 'Manage Portfolio Categories'}
              </h2>
              <form onSubmit={handleSaveCategory} className="flex flex-wrap gap-3">
                <input
                  type="text"
                  required
                  placeholder="Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 min-w-[200px] px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                />
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategoryId(null);
                      setNewCategoryName('');
                      setNewCategoryVisible(true);
                    }}
                    className="px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg cursor-pointer"
                >
                  {editingCategoryId ? 'Update Category' : 'Add Category'}
                </button>
              </form>

              <div className="space-y-2.5">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#202124] truncate">{cat.name}</p>
                      <p className="text-xs font-mono text-[#6B7280] truncate">
                        {cat.slug} · {cat.isVisible ? 'Active' : 'Hidden'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleCategoryVisibility(cat)}
                        className="p-2 text-[#6B7280] hover:text-[#315E9B] cursor-pointer"
                        title={cat.isVisible ? 'Hide category' : 'Show category'}
                      >
                        {cat.isVisible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId(cat.id);
                          setNewCategoryName(cat.name);
                          setNewCategoryVisible(cat.isVisible);
                        }}
                        className="p-2 text-[#6B7280] hover:text-[#315E9B] cursor-pointer"
                        title="Edit category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategoryDoc(cat.id).catch(showError)}
                        className="p-2 text-[#6B7280] hover:text-red-700 cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CV & SETTINGS TAB */}
          {activeTab === 'settings' && (
            <form
              onSubmit={handleSaveSettings}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-6"
            >
              <div>
                <h2 className="font-display text-xl font-bold text-[#202124]">
                  Manage CV PDF &amp; Website Settings
                </h2>
                <p className="text-sm text-[#6B7280]">
                  Upload your original PDF resume to Firebase Storage and configure SEO metadata.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-4">
                <FileUploader
                  mode="pdf"
                  folderPath="cv"
                  label="Curriculum Vitae PDF (Original unmodified PDF)"
                  currentUrl={settingsForm.cvUrl}
                  onUploaded={(url, fileName) =>
                    setSettingsForm((s) => ({
                      ...s,
                      cvUrl: url,
                      cvFileName: fileName || s.cvFileName || 'MD_AL_AMIN_CV.pdf',
                    }))
                  }
                />

                {settingsForm.cvUrl && (
                  <div className="pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-[#202124]">
                      <FileText className="w-4 h-4 text-[#315E9B]" />
                      <span>Active CV: {settingsForm.cvFileName || 'CV.pdf'}</span>
                    </span>
                    <a
                      href={settingsForm.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#315E9B] hover:underline"
                    >
                      Preview / Download Current CV
                    </a>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-4">
                <FileUploader
                  mode="pdf"
                  folderPath="cv"
                  label="Cover Letter PDF (Original unmodified PDF)"
                  currentUrl={settingsForm.coverLetterUrl || ''}
                  onUploaded={(url, fileName) =>
                    setSettingsForm((s) => ({
                      ...s,
                      coverLetterUrl: url,
                      coverLetterFileName:
                        fileName || s.coverLetterFileName || 'MD_AL_AMIN_Cover_Letter.pdf',
                    }))
                  }
                />

                {settingsForm.coverLetterUrl && (
                  <div className="pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-[#202124]">
                      <FileText className="w-4 h-4 text-[#315E9B]" />
                      <span>
                        Active Cover Letter:{' '}
                        {settingsForm.coverLetterFileName || 'Cover_Letter.pdf'}
                      </span>
                    </span>
                    <a
                      href={settingsForm.coverLetterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#315E9B] hover:underline"
                    >
                      Preview / Download Current Cover Letter
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">
                    Website Title
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.websiteTitle}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, websiteTitle: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">
                    SEO Meta Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={settingsForm.metaDescription}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, metaDescription: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                </div>

                <FileUploader
                  mode="image"
                  folderPath="assets"
                  label="Social Sharing Preview Image (OpenGraph)"
                  currentUrl={settingsForm.socialImageUrl}
                  onUploaded={(url) =>
                    setSettingsForm((s) => ({ ...s, socialImageUrl: url }))
                  }
                />

                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1.5">
                    Footer Subtitle Text
                  </label>
                  <input
                    type="text"
                    value={settingsForm.footerText}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, footerText: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] disabled:opacity-60 rounded-lg cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save CV & Settings'}</span>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};
