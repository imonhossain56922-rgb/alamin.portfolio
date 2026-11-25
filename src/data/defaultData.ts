import {
  CategoryItem,
  ExperienceItem,
  ProfileData,
  ProjectItem,
  SiteSettings,
  SkillItem,
  SoftwareItem,
} from '../types/portfolio';

export const ADMIN_EMAIL = 'alaminshakil56922@gmail.com';
export const ADMIN_EMAILS = ['alaminshakil56922@gmail.com', 'imonhossain56922@gmail.com'];

export const PROFILE_PHOTO_PATH =
  '/assets/aistudio/5761AC70-E650-467C-BDBC-4BDDFE06C13F_2_c3a4dc69.PNG';

export const defaultProfile: ProfileData = {
  fullName: 'MD AL AMIN',
  professionalTitle: 'Professional Graphic Designer',
  headline: 'Creative Thinking. Professional Design.',
  supportingDescription:
    'Transforming creative ideas into impactful visual experiences through professional graphic design, commercial printing, and production expertise.',
  specialtyLine:
    'Graphic Design | Advertising | Print Production | DTF & UV Printing | 3D Exhibition Design',
  location: 'Dubai, United Arab Emirates',
  experience: 'Approximately 10 Years',
  biography: `I am MD Al Amin, a professional Graphic Designer with approximately 10 years of experience in graphic design, advertising, commercial printing, print production, and 3D exhibition design.

Throughout my professional journey, I have developed strong expertise in transforming creative concepts into practical, production-ready visual solutions.

My experience includes working with different printing technologies, preparing high-quality artwork, creating digital mockups, and developing professional designs for commercial and promotional purposes.

I am passionate about creative problem-solving, visual communication, and delivering quality-driven design solutions.`,
  profileImageUrl: '',
  aboutImageUrl: PROFILE_PHOTO_PATH,
  email: '',
  phone: '',
  whatsapp: '',
  linkedin: '',
  behance: '',
  showEmail: true,
  showWhatsapp: true,
  showLinkedin: true,
  showBehance: true,
};

export const defaultSettings: SiteSettings = {
  websiteTitle: 'MD Al Amin | Professional Graphic Designer Portfolio',
  metaDescription:
    'Professional Graphic Designer with approximately 10 years of experience in advertising, commercial graphic design, DTF and UV printing, print production, and 3D exhibition design.',
  cvUrl: '',
  cvFileName: 'MD_AL_AMIN_CV.pdf',
  coverLetterUrl: '',
  coverLetterFileName: 'MD_AL_AMIN_Cover_Letter.pdf',
  socialImageUrl: PROFILE_PHOTO_PATH,
  footerText: 'Professional Graphic Designer · Dubai, United Arab Emirates',
};

export const defaultExperiences: ExperienceItem[] = [
  {
    id: 'exp-the-merchlist',
    companyName: 'THE MERCHLIST',
    position: 'Graphic Designer',
    location: 'United Arab Emirates',
    startDate: '2024',
    endDate: 'Present',
    responsibilities: [
      'Creating professional graphic designs for customized merchandise and promotional products.',
      'Developing creative digital mockups for client presentations.',
      'Preparing print-ready artwork for different printing technologies.',
      'Working with DTF, UV DTF, UV printing, engraving, embroidery, and other production methods.',
      'Designing advertising and promotional materials.',
      'Supporting production teams with technical artwork preparation.',
      'Maintaining professional design quality and brand consistency.',
    ],
    displayOrder: 1,
    isVisible: true,
  },
  {
    id: 'exp-pran-rfl',
    companyName: 'PRAN-RFL GROUP',
    position: 'Graphic Designer',
    location: 'Bangladesh',
    startDate: '2017',
    endDate: '2024',
    responsibilities: [
      'Professional advertising and commercial graphic design.',
      'Designing promotional and marketing materials.',
      'Print production and prepress artwork preparation.',
      'Offset and screen printing artwork.',
      'CMYK color management and color separation.',
      'Bleed, trimming, and print layout setup.',
      'Preparing high-quality production-ready artwork.',
      'Supporting different commercial printing requirements.',
    ],
    displayOrder: 2,
    isVisible: true,
  },
];

export const defaultSkills: SkillItem[] = [
  // Graphic Design
  { id: 'skill-gd-1', name: 'Professional Graphic Design', category: 'Graphic Design', icon: 'PenTool', displayOrder: 1, isVisible: true },
  { id: 'skill-gd-2', name: 'Advertising & Commercial Design', category: 'Graphic Design', icon: 'Megaphone', displayOrder: 2, isVisible: true },
  { id: 'skill-gd-3', name: 'Branding & Promotional Design', category: 'Graphic Design', icon: 'Award', displayOrder: 3, isVisible: true },
  { id: 'skill-gd-4', name: 'Packaging & Marketing Materials', category: 'Graphic Design', icon: 'Package', displayOrder: 4, isVisible: true },
  { id: 'skill-gd-5', name: 'Digital Mockup Design', category: 'Graphic Design', icon: 'Monitor', displayOrder: 5, isVisible: true },

  // Printing Technology
  { id: 'skill-pt-1', name: 'DTF Printing', category: 'Printing Technology', icon: 'Printer', displayOrder: 6, isVisible: true },
  { id: 'skill-pt-2', name: 'UV DTF Printing', category: 'Printing Technology', icon: 'Layers', displayOrder: 7, isVisible: true },
  { id: 'skill-pt-3', name: 'UV Printing', category: 'Printing Technology', icon: 'Sparkles', displayOrder: 8, isVisible: true },
  { id: 'skill-pt-4', name: 'Offset Printing', category: 'Printing Technology', icon: 'Grid', displayOrder: 9, isVisible: true },
  { id: 'skill-pt-5', name: 'Screen Printing', category: 'Printing Technology', icon: 'Frame', displayOrder: 10, isVisible: true },
  { id: 'skill-pt-6', name: 'Embroidery Artwork', category: 'Printing Technology', icon: 'Scissors', displayOrder: 11, isVisible: true },
  { id: 'skill-pt-7', name: 'Laser Engraving Artwork', category: 'Printing Technology', icon: 'Crosshair', displayOrder: 12, isVisible: true },

  // Print Production
  { id: 'skill-pp-1', name: 'Print Production', category: 'Print Production', icon: 'FileCheck', displayOrder: 13, isVisible: true },
  { id: 'skill-pp-2', name: 'Prepress', category: 'Print Production', icon: 'Sliders', displayOrder: 14, isVisible: true },
  { id: 'skill-pp-3', name: 'Print-ready Artwork', category: 'Print Production', icon: 'CheckSquare', displayOrder: 15, isVisible: true },
  { id: 'skill-pp-4', name: 'CMYK Color Separation', category: 'Print Production', icon: 'Palette', displayOrder: 16, isVisible: true },
  { id: 'skill-pp-5', name: 'Color Management', category: 'Print Production', icon: 'Droplet', displayOrder: 17, isVisible: true },
  { id: 'skill-pp-6', name: 'Bleed and Trimming Setup', category: 'Print Production', icon: 'Crop', displayOrder: 18, isVisible: true },

  // 3D Design
  { id: 'skill-3d-1', name: '3D Exhibition Design', category: '3D Design', icon: 'Box', displayOrder: 19, isVisible: true },
  { id: 'skill-3d-2', name: 'Exhibition Stand Design', category: '3D Design', icon: 'Layout', displayOrder: 20, isVisible: true },
  { id: 'skill-3d-3', name: '3D Visualization', category: '3D Design', icon: 'Compass', displayOrder: 21, isVisible: true },
];

export const defaultSoftware: SoftwareItem[] = [
  { id: 'sw-photoshop', name: 'Adobe Photoshop', shortCode: 'Ps', brandColor: '#31A8FF', iconUrl: '', displayOrder: 1, isVisible: true },
  { id: 'sw-illustrator', name: 'Adobe Illustrator', shortCode: 'Ai', brandColor: '#FF9A00', iconUrl: '', displayOrder: 2, isVisible: true },
  { id: 'sw-premiere', name: 'Adobe Premiere Pro', shortCode: 'Pr', brandColor: '#9999FF', iconUrl: '', displayOrder: 3, isVisible: true },
  { id: 'sw-after-effects', name: 'Adobe After Effects', shortCode: 'Ae', brandColor: '#9999FF', iconUrl: '', displayOrder: 4, isVisible: true },
  { id: 'sw-sketchup', name: 'SketchUp Pro', shortCode: 'SU', brandColor: '#005F9E', iconUrl: '', displayOrder: 5, isVisible: true },
  { id: 'sw-office', name: 'Microsoft Office', shortCode: 'M365', brandColor: '#D83B01', iconUrl: '', displayOrder: 6, isVisible: true },
];

export const defaultCategories: CategoryItem[] = [
  { id: 'cat-graphic-advertising', name: 'Graphic Design & Advertising', slug: 'graphic-design-advertising', displayOrder: 1, isVisible: true },
  { id: 'cat-branding-promotional', name: 'Branding & Promotional Design', slug: 'branding-promotional-design', displayOrder: 2, isVisible: true },
  { id: 'cat-dtf-uv-dtf', name: 'DTF & UV DTF Printing', slug: 'dtf-uv-dtf-printing', displayOrder: 3, isVisible: true },
  { id: 'cat-uv-offset', name: 'UV & Offset Printing', slug: 'uv-offset-printing', displayOrder: 4, isVisible: true },
  { id: 'cat-custom-merch', name: 'Customized Merchandise', slug: 'customized-merchandise', displayOrder: 5, isVisible: true },
  { id: 'cat-digital-mockup', name: 'Digital Mockup Design', slug: 'digital-mockup-design', displayOrder: 6, isVisible: true },
  { id: 'cat-3d-exhibition', name: '3D Exhibition & Stand Design', slug: '3d-exhibition-stand-design', displayOrder: 7, isVisible: true },
  { id: 'cat-commercial-print', name: 'Commercial Print Production', slug: 'commercial-print-production', displayOrder: 8, isVisible: true },
];

/**
 * Clean placeholder project slots shown ONLY when no published projects exist in Firestore yet.
 * Marked explicitly as placeholders needing actual project image uploads via Admin CMS.
 */
export const placeholderProjects: ProjectItem[] = [
  {
    id: 'placeholder-1',
    title: 'Graphic Design & Advertising Showcase Slot',
    categoryId: 'cat-graphic-advertising',
    categoryName: 'Graphic Design & Advertising',
    description:
      'Placeholder slot reserved for actual commercial campaign and advertising design artwork. Replace with real project images, print specifications, and client presentation visuals from the Admin Dashboard.',
    coverImageUrl: '',
    galleryImages: [],
    softwareUsed: ['Adobe Illustrator', 'Adobe Photoshop'],
    printingTechnology: 'Offset & Digital Commercial Print',
    projectDetails: 'Awaiting upload of verified project photography and prepress artwork files.',
    completionDate: 'Ready for Upload',
    published: true,
    displayOrder: 1,
    isPlaceholder: true,
  },
  {
    id: 'placeholder-2',
    title: 'DTF & UV DTF Production Artwork Slot',
    categoryId: 'cat-dtf-uv-dtf',
    categoryName: 'DTF & UV DTF Printing',
    description:
      'Placeholder slot reserved for Direct-to-Film (DTF) apparel transfers and UV DTF hard-surface decal production artwork. Upload actual transfer proofs and finished merchandise photos in the Admin CMS.',
    coverImageUrl: '',
    galleryImages: [],
    softwareUsed: ['Adobe Illustrator', 'Adobe Photoshop'],
    printingTechnology: 'DTF & UV DTF Transfer',
    projectDetails: 'Awaiting upload of real production-ready artwork and finished output photos.',
    completionDate: 'Ready for Upload',
    published: true,
    displayOrder: 2,
    isPlaceholder: true,
  },
  {
    id: 'placeholder-3',
    title: 'Customized Merchandise & Mockup Slot',
    categoryId: 'cat-custom-merch',
    categoryName: 'Customized Merchandise',
    description:
      'Placeholder slot reserved for corporate gifting, customized promotional merchandise, and realistic client presentation mockups. Upload real project images through the Admin Dashboard.',
    coverImageUrl: '',
    galleryImages: [],
    softwareUsed: ['Adobe Photoshop', 'Adobe Illustrator'],
    printingTechnology: 'UV Printing · Laser Engraving · Embroidery',
    projectDetails: 'Awaiting upload of actual product mockups and finished merchandise images.',
    completionDate: 'Ready for Upload',
    published: true,
    displayOrder: 3,
    isPlaceholder: true,
  },
  {
    id: 'placeholder-4',
    title: '3D Exhibition & Stand Visualization Slot',
    categoryId: 'cat-3d-exhibition',
    categoryName: '3D Exhibition & Stand Design',
    description:
      'Placeholder slot reserved for 3D exhibition booth layouts, trade show stand visualizations, and spatial branding renders created in SketchUp Pro.',
    coverImageUrl: '',
    galleryImages: [],
    softwareUsed: ['SketchUp Pro', 'Adobe Photoshop'],
    printingTechnology: 'Large-Format Exhibition Graphics',
    projectDetails: 'Awaiting upload of real 3D stand renders and structural booth visuals.',
    completionDate: 'Ready for Upload',
    published: true,
    displayOrder: 4,
    isPlaceholder: true,
  },
];
