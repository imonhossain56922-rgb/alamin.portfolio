export type SkillCategory =
  | 'Graphic Design'
  | 'Printing Technology'
  | 'Print Production'
  | '3D Design';

export interface ProfileData {
  fullName: string;
  professionalTitle: string;
  headline: string;
  supportingDescription: string;
  specialtyLine: string;
  location: string;
  experience: string;
  biography: string;
  profileImageUrl: string;
  aboutImageUrl?: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedin: string;
  behance: string;
  showEmail?: boolean;
  showWhatsapp?: boolean;
  showLinkedin?: boolean;
  showBehance?: boolean;
  updatedAt?: unknown;
}

export interface ExperienceItem {
  id: string;
  companyName: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  displayOrder: number;
  isVisible: boolean;
  updatedAt?: unknown;
}

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  icon: string;
  displayOrder: number;
  isVisible: boolean;
  updatedAt?: unknown;
}

export interface SoftwareItem {
  id: string;
  name: string;
  shortCode: string;
  brandColor: string;
  iconUrl: string;
  displayOrder: number;
  isVisible: boolean;
  updatedAt?: unknown;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isVisible: boolean;
  updatedAt?: unknown;
}

export interface ProjectItem {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  description: string;
  coverImageUrl: string;
  galleryImages: string[];
  softwareUsed: string[];
  printingTechnology: string;
  projectDetails: string;
  completionDate: string;
  published: boolean;
  displayOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
  isPlaceholder?: boolean;
}

export interface SiteSettings {
  websiteTitle: string;
  metaDescription: string;
  cvUrl: string;
  cvFileName: string;
  coverLetterUrl?: string;
  coverLetterFileName?: string;
  socialImageUrl: string;
  footerText: string;
  updatedAt?: unknown;
}
