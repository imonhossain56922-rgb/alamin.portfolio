import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  defaultCategories,
  defaultExperiences,
  defaultProfile,
  defaultSettings,
  defaultSkills,
  defaultSoftware,
  placeholderProjects,
} from '../data/defaultData';
import {
  CategoryItem,
  ExperienceItem,
  ProfileData,
  ProjectItem,
  SiteSettings,
  SkillItem,
  SoftwareItem,
} from '../types/portfolio';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreError';

// --- Defensive Payload Helpers (Synchronized with firebase-blueprint.json) ---
function clampStr(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function clampStringList(arr: unknown, maxItems: number, maxItemLen: number): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .slice(0, maxItems)
    .map((item) => item.trim().slice(0, maxItemLen));
}

export function sanitizeId(raw: string, prefix = 'item'): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  if (cleaned.length >= 2) return cleaned;
  return `${prefix}-${Date.now()}`;
}

export function sanitizeSlug(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
  return cleaned || `category-${Date.now()}`;
}

// --- Public Real-time Subscriptions ---

export function subscribePublicProfile(
  onData: (profile: ProfileData, existsInDb: boolean) => void,
  onError?: (err: Error) => void
) {
  const path = 'profile/main';
  return onSnapshot(
    doc(db, 'profile', 'main'),
    (snap) => {
      if (snap.exists()) {
        onData({ ...defaultProfile, ...(snap.data() as Partial<ProfileData>) }, true);
      } else {
        onData(defaultProfile, false);
      }
    },
    (error) => {
      console.warn('Profile snapshot error:', error);
      onData(defaultProfile, false);
      if (onError) onError(error);
    }
  );
}

export function subscribePublicSettings(
  onData: (settings: SiteSettings, existsInDb: boolean) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    doc(db, 'settings', 'site'),
    (snap) => {
      if (snap.exists()) {
        onData({ ...defaultSettings, ...(snap.data() as Partial<SiteSettings>) }, true);
      } else {
        onData(defaultSettings, false);
      }
    },
    (error) => {
      console.warn('Settings snapshot error:', error);
      onData(defaultSettings, false);
      if (onError) onError(error);
    }
  );
}

export function subscribeVisibleExperiences(
  onData: (items: ExperienceItem[], fromDb: boolean) => void
) {
  const q = query(collection(db, 'experiences'), where('isVisible', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        onData(defaultExperiences, false);
        return;
      }
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<ExperienceItem, 'id'>) }))
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      onData(list, true);
    },
    (error) => {
      console.warn('Experiences snapshot error:', error);
      onData(defaultExperiences, false);
    }
  );
}

export function subscribeVisibleSkills(onData: (items: SkillItem[], fromDb: boolean) => void) {
  const q = query(collection(db, 'skills'), where('isVisible', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        onData(defaultSkills, false);
        return;
      }
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<SkillItem, 'id'>) }))
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      onData(list, true);
    },
    (error) => {
      console.warn('Skills snapshot error:', error);
      onData(defaultSkills, false);
    }
  );
}

export function subscribeVisibleSoftware(onData: (items: SoftwareItem[], fromDb: boolean) => void) {
  const q = query(collection(db, 'software'), where('isVisible', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        onData(defaultSoftware, false);
        return;
      }
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<SoftwareItem, 'id'>) }))
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      onData(list, true);
    },
    (error) => {
      console.warn('Software snapshot error:', error);
      onData(defaultSoftware, false);
    }
  );
}

export function subscribeVisibleCategories(onData: (items: CategoryItem[], fromDb: boolean) => void) {
  const q = query(collection(db, 'categories'), where('isVisible', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        onData(defaultCategories, false);
        return;
      }
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<CategoryItem, 'id'>) }))
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      onData(list, true);
    },
    (error) => {
      console.warn('Categories snapshot error:', error);
      onData(defaultCategories, false);
    }
  );
}

export function subscribePublishedProjects(onData: (items: ProjectItem[], fromDb: boolean) => void) {
  const q = query(collection(db, 'projects'), where('published', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectItem, 'id'>) }))
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      onData(list, !snap.empty);
    },
    (error) => {
      console.warn('Published projects snapshot error:', error);
      onData([], false);
    }
  );
}

// --- Admin Subscriptions (All items, including drafts/hidden) ---

export function subscribeAdminCollection<T extends { id: string; displayOrder?: number }>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError: (err: Error) => void
) {
  return onSnapshot(
    collection(db, collectionName),
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<T, 'id'>) }) as T)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, collectionName);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function checkIsAdminUser(uid: string, email: string | null, emailVerified: boolean): Promise<boolean> {
  const normalized = (email || '').toLowerCase();
  if (
    emailVerified &&
    (normalized === 'alaminshakil56922@gmail.com' || normalized === 'imonhossain56922@gmail.com')
  ) {
    return true;
  }
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists() && adminDoc.data()?.role === 'admin';
  } catch {
    return false;
  }
}

// --- Admin Write Operations (Safe, Validated, Non-Destructive) ---

export async function saveProfile(data: ProfileData): Promise<void> {
  const path = 'profile/main';
  const payload = {
    fullName: clampStr(data.fullName, 120) || 'MD AL AMIN',
    professionalTitle: clampStr(data.professionalTitle, 160) || 'Professional Graphic Designer',
    headline: clampStr(data.headline, 240) || defaultProfile.headline,
    supportingDescription:
      clampStr(data.supportingDescription, 600) || defaultProfile.supportingDescription,
    specialtyLine: clampStr(data.specialtyLine, 240),
    location: clampStr(data.location, 160) || 'Dubai, United Arab Emirates',
    experience: clampStr(data.experience, 120) || 'Approximately 10 Years',
    biography: clampStr(data.biography, 4000) || defaultProfile.biography,
    profileImageUrl: clampStr(data.profileImageUrl, 950000),
    aboutImageUrl: clampStr(data.aboutImageUrl, 950000),
    email: clampStr(data.email, 200),
    phone: clampStr(data.phone, 60),
    whatsapp: clampStr(data.whatsapp, 200),
    linkedin: clampStr(data.linkedin, 400),
    behance: clampStr(data.behance, 400),
    showEmail: data.showEmail !== false,
    showWhatsapp: data.showWhatsapp !== false,
    showLinkedin: data.showLinkedin !== false,
    showBehance: data.showBehance !== false,
    updatedAt: serverTimestamp(),
  };

  try {
    const ref = doc(db, 'profile', 'main');
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, payload);
    } else {
      await setDoc(ref, payload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveSiteSettings(data: SiteSettings): Promise<void> {
  const path = 'settings/site';
  const payload = {
    websiteTitle: clampStr(data.websiteTitle, 160) || defaultSettings.websiteTitle,
    metaDescription: clampStr(data.metaDescription, 400) || defaultSettings.metaDescription,
    cvUrl: clampStr(data.cvUrl, 950000),
    cvFileName: clampStr(data.cvFileName, 240),
    coverLetterUrl: clampStr(data.coverLetterUrl, 950000),
    coverLetterFileName: clampStr(data.coverLetterFileName, 240),
    socialImageUrl: clampStr(data.socialImageUrl, 950000),
    footerText: clampStr(data.footerText, 300),
    updatedAt: serverTimestamp(),
  };

  try {
    const ref = doc(db, 'settings', 'site');
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, payload);
    } else {
      await setDoc(ref, payload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveProject(
  project: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || sanitizeId(project.title, 'proj');
  const path = `projects/${id}`;
  const basePayload = {
    title: clampStr(project.title, 180) || 'Untitled Project',
    categoryId: sanitizeId(project.categoryId || 'cat-graphic-advertising', 'cat'),
    categoryName: clampStr(project.categoryName, 120) || 'Graphic Design & Advertising',
    description: clampStr(project.description, 4000) || 'Project description.',
    coverImageUrl: clampStr(project.coverImageUrl, 950000),
    galleryImages: clampStringList(project.galleryImages, 12, 300000),
    softwareUsed: clampStringList(project.softwareUsed, 12, 120),
    printingTechnology: clampStr(project.printingTechnology, 240),
    projectDetails: clampStr(project.projectDetails, 2000),
    completionDate: clampStr(project.completionDate, 60),
    published: Boolean(project.published),
    displayOrder: Number.isFinite(project.displayOrder) ? project.displayOrder : 1,
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = doc(db, 'projects', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, basePayload);
    } else {
      await setDoc(docRef, {
        ...basePayload,
        createdAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProjectDoc(projectId: string): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveExperience(
  exp: Omit<ExperienceItem, 'id' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || sanitizeId(exp.companyName, 'exp');
  const path = `experiences/${id}`;
  const payload = {
    companyName: clampStr(exp.companyName, 160) || 'Company',
    position: clampStr(exp.position, 160) || 'Graphic Designer',
    location: clampStr(exp.location, 160) || 'Location',
    startDate: clampStr(exp.startDate, 40) || '2024',
    endDate: clampStr(exp.endDate, 40) || 'Present',
    responsibilities: clampStringList(exp.responsibilities, 20, 400),
    displayOrder: Number.isFinite(exp.displayOrder) ? exp.displayOrder : 1,
    isVisible: Boolean(exp.isVisible),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = doc(db, 'experiences', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, payload);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExperienceDoc(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'experiences', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `experiences/${id}`);
  }
}

export async function saveSkill(
  skill: Omit<SkillItem, 'id' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || sanitizeId(skill.name, 'skill');
  const path = `skills/${id}`;
  const payload = {
    name: clampStr(skill.name, 140) || 'Skill',
    category: skill.category,
    icon: clampStr(skill.icon || 'CheckCircle', 60),
    displayOrder: Number.isFinite(skill.displayOrder) ? skill.displayOrder : 1,
    isVisible: Boolean(skill.isVisible),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = doc(db, 'skills', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, payload);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSkillDoc(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'skills', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `skills/${id}`);
  }
}

export async function saveSoftware(
  sw: Omit<SoftwareItem, 'id' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || sanitizeId(sw.name, 'sw');
  const path = `software/${id}`;
  const payload = {
    name: clampStr(sw.name, 120) || 'Software',
    shortCode: clampStr(sw.shortCode, 10),
    brandColor: clampStr(sw.brandColor || '#315E9B', 30),
    iconUrl: clampStr(sw.iconUrl, 950000),
    displayOrder: Number.isFinite(sw.displayOrder) ? sw.displayOrder : 1,
    isVisible: Boolean(sw.isVisible),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = doc(db, 'software', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, payload);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSoftwareDoc(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'software', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `software/${id}`);
  }
}

export async function saveCategory(
  cat: Omit<CategoryItem, 'id' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || sanitizeId(cat.name, 'cat');
  const path = `categories/${id}`;
  const payload = {
    name: clampStr(cat.name, 120) || 'Category',
    slug: sanitizeSlug(cat.slug || cat.name),
    displayOrder: Number.isFinite(cat.displayOrder) ? cat.displayOrder : 1,
    isVisible: Boolean(cat.isVisible),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = doc(db, 'categories', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, payload);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCategoryDoc(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
  }
}

/**
 * Safely seeds ONLY missing baseline documents into Firestore when triggered explicitly by an authenticated Admin.
 * Never overwrites or deletes existing database records.
 */
export async function seedMissingDefaults(): Promise<{ createdCount: number }> {
  let createdCount = 0;
  try {
    const batch = writeBatch(db);

    const profileRef = doc(db, 'profile', 'main');
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) {
      batch.set(profileRef, { ...defaultProfile, updatedAt: serverTimestamp() });
      createdCount++;
    }

    const settingsRef = doc(db, 'settings', 'site');
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      batch.set(settingsRef, { ...defaultSettings, updatedAt: serverTimestamp() });
      createdCount++;
    }

    const expSnap = await getDocs(collection(db, 'experiences'));
    if (expSnap.empty) {
      for (const exp of defaultExperiences) {
        const { id, ...rest } = exp;
        batch.set(doc(db, 'experiences', id), { ...rest, updatedAt: serverTimestamp() });
        createdCount++;
      }
    }

    const skillsSnap = await getDocs(collection(db, 'skills'));
    if (skillsSnap.empty) {
      for (const skill of defaultSkills) {
        const { id, ...rest } = skill;
        batch.set(doc(db, 'skills', id), { ...rest, updatedAt: serverTimestamp() });
        createdCount++;
      }
    }

    const swSnap = await getDocs(collection(db, 'software'));
    if (swSnap.empty) {
      for (const sw of defaultSoftware) {
        const { id, ...rest } = sw;
        batch.set(doc(db, 'software', id), { ...rest, updatedAt: serverTimestamp() });
        createdCount++;
      }
    }

    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      for (const cat of defaultCategories) {
        const { id, ...rest } = cat;
        batch.set(doc(db, 'categories', id), { ...rest, updatedAt: serverTimestamp() });
        createdCount++;
      }
    }

    if (createdCount > 0) {
      await batch.commit();
    }
    return { createdCount };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seedMissingDefaults');
  }
}

export async function importStarterProjectsIfEmpty(): Promise<number> {
  try {
    const existingSnap = await getDocs(collection(db, 'projects'));
    if (!existingSnap.empty) return 0;

    const batch = writeBatch(db);
    let count = 0;
    for (const proj of placeholderProjects) {
      const { id, isPlaceholder: _ignored, ...rest } = proj;
      batch.set(doc(db, 'projects', id), {
        ...rest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      count++;
    }
    await batch.commit();
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'projects');
  }
}
