import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Eye,
  EyeOff,
  Link2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { CategoryItem, ProjectItem } from '../../types/portfolio';
import {
  deleteProjectDoc,
  importStarterProjectsIfEmpty,
  sanitizeId,
  saveProject,
} from '../../lib/portfolioService';
import { FileUploader } from './FileUploader';
import { ProjectPlaceholderVisual } from '../ProjectPlaceholderVisual';
import { MediaVideo } from '../MediaVideo';

interface ProjectsManagerProps {
  projects: ProjectItem[];
  categories: CategoryItem[];
}

const emptyForm = (categories: CategoryItem[], nextOrder: number) => ({
  title: '',
  categoryId: categories[0]?.id || 'cat-graphic-advertising',
  categoryName: categories[0]?.name || 'Graphic Design & Advertising',
  description: '',
  coverImageUrl: '',
  galleryImages: [] as string[],
  galleryVideos: [] as string[],
  softwareUsedText: 'Adobe Illustrator, Adobe Photoshop',
  printingTechnology: '',
  projectDetails: '',
  completionDate: '',
  published: true,
  displayOrder: nextOrder,
});

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  categories,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState(() => emptyForm(categories, projects.length + 1));
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [importingStarters, setImportingStarters] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);

  const handleLoadStarters = async () => {
    setImportingStarters(true);
    setStatusMsg(null);
    try {
      const count = await importStarterProjectsIfEmpty();
      setStatusMsg({
        type: 'ok',
        text:
          count > 0
            ? `Loaded ${count} starter project slots. You can now edit or replace them.`
            : 'Projects already exist in Firestore.',
      });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to load starter projects.',
      });
    } finally {
      setImportingStarters(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(categories, projects.length + 1));
    setVideoUrlInput('');
    setStatusMsg(null);
    setShowEditor(true);
  };

  const openEdit = (p: ProjectItem) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      description: p.description,
      coverImageUrl: p.coverImageUrl || '',
      galleryImages: p.galleryImages || [],
      galleryVideos: p.galleryVideos || [],
      softwareUsedText: (p.softwareUsed || []).join(', '),
      printingTechnology: p.printingTechnology || '',
      projectDetails: p.projectDetails || '',
      completionDate: p.completionDate || '',
      published: p.published,
      displayOrder: p.displayOrder ?? 1,
    });
    setVideoUrlInput('');
    setStatusMsg(null);
    setShowEditor(true);
  };

  const handleAddVideoLink = () => {
    const trimmed = videoUrlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setStatusMsg({
        type: 'err',
        text: 'Please enter a valid video URL starting with https:// or http://',
      });
      return;
    }
    setForm((f) => ({
      ...f,
      galleryVideos: [...f.galleryVideos, trimmed].slice(0, 6),
    }));
    setVideoUrlInput('');
    setStatusMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setStatusMsg({ type: 'err', text: 'Project title and description are required.' });
      return;
    }

    setSaving(true);
    setStatusMsg(null);
    try {
      const cat = categories.find((c) => c.id === form.categoryId);
      const softwareUsed = form.softwareUsedText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12);

      await saveProject(
        {
          title: form.title,
          categoryId: form.categoryId,
          categoryName: cat?.name || form.categoryName,
          description: form.description,
          coverImageUrl: form.coverImageUrl,
          galleryImages: form.galleryImages,
          galleryVideos: form.galleryVideos,
          softwareUsed,
          printingTechnology: form.printingTechnology,
          projectDetails: form.projectDetails,
          completionDate: form.completionDate,
          published: form.published,
          displayOrder: Number(form.displayOrder) || 1,
        },
        editingId || undefined
      );
      setShowEditor(false);
      setStatusMsg({ type: 'ok', text: 'Project saved to Firestore.' });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save project.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (p: ProjectItem) => {
    try {
      await saveProject(
        {
          ...p,
          published: !p.published,
        },
        p.id
      );
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to update visibility.',
      });
    }
  };

  const handleReorder = async (index: number, delta: -1 | 1) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= projects.length) return;
    const current = projects[index];
    const swap = projects[targetIndex];
    try {
      await Promise.all([
        saveProject({ ...current, displayOrder: targetIndex + 1 }, current.id),
        saveProject({ ...swap, displayOrder: index + 1 }, swap.id),
      ]);
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to reorder project.',
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProjectDoc(deleteTarget.id);
      setDeleteTarget(null);
      setStatusMsg({ type: 'ok', text: 'Project deleted.' });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to delete project.',
      });
    }
  };

  const activeStorageFolder = `projects/${editingId || sanitizeId(form.title || 'new', 'proj')}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#202124]">
            Portfolio Projects ({projects.length})
          </h2>
          <p className="text-sm text-[#6B7280]">
            Add, edit, upload images and videos, reorder, and control published visibility.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`px-4 py-3 rounded-xl text-xs border ${
            statusMsg.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Editor Modal / Drawer */}
      {showEditor && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
            <h3 className="font-display text-lg font-bold text-[#202124]">
              {editingId ? 'Edit Project' : 'Create New Portfolio Project'}
            </h3>
            <button
              type="button"
              onClick={() => setShowEditor(false)}
              className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#202124] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Corporate Merchandise DTF Campaign"
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#315E9B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">
                  Category *
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => {
                    const cat = categories.find((c) => c.id === e.target.value);
                    setForm((f) => ({
                      ...f,
                      categoryId: e.target.value,
                      categoryName: cat?.name || f.categoryName,
                    }));
                  }}
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:border-[#315E9B]"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#202124] mb-1.5">
                Project Description *
              </label>
              <textarea
                rows={4}
                required
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the design brief, commercial objective, and print production outcome..."
                className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#315E9B]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">
                  Printing Technology
                </label>
                <input
                  type="text"
                  value={form.printingTechnology}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, printingTechnology: e.target.value }))
                  }
                  placeholder="e.g., UV DTF & Laser Engraving"
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#315E9B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">
                  Software Used (comma separated)
                </label>
                <input
                  type="text"
                  value={form.softwareUsedText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, softwareUsedText: e.target.value }))
                  }
                  placeholder="Adobe Illustrator, Adobe Photoshop"
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#315E9B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1.5">
                  Completion Date (optional)
                </label>
                <input
                  type="text"
                  value={form.completionDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, completionDate: e.target.value }))
                  }
                  placeholder="e.g., 2025"
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#315E9B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#202124] mb-1.5">
                Technical / Prepress Details
              </label>
              <textarea
                rows={2}
                value={form.projectDetails}
                onChange={(e) => setForm((f) => ({ ...f, projectDetails: e.target.value }))}
                placeholder="CMYK color separations, bleed dimensions, substrate notes..."
                className="w-full px-3.5 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#315E9B]"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-5">
              <FileUploader
                mode="image"
                folderPath={activeStorageFolder}
                label="Cover Image (Optional if uploading video — Recommended 4:3 or 16:10)"
                currentUrl={form.coverImageUrl}
                onUploaded={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))}
              />

              <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
                <FileUploader
                  mode="image"
                  folderPath={activeStorageFolder}
                  label="Add Gallery Image (up to 12 images)"
                  currentUrl=""
                  allowManualUrl={false}
                  onUploaded={(url) => {
                    if (!url) return;
                    setForm((f) => ({
                      ...f,
                      galleryImages: [...f.galleryImages, url].slice(0, 12),
                    }));
                  }}
                />

                {form.galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {form.galleryImages.map((imgUrl, idx) => (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className="relative overflow-hidden aspect-[4/3]"
                      >
                        <img
                          src={imgUrl}
                          alt={`Gallery item ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              galleryImages: f.galleryImages.filter((_, i) => i !== idx),
                            }))
                          }
                          aria-label="Remove gallery image"
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-white/90 text-red-700 flex items-center justify-center border border-[#E5E7EB] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Videos Upload & Link Section */}
              <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
                <FileUploader
                  mode="video"
                  folderPath={activeStorageFolder}
                  label={`Add Portfolio Videos (${form.galleryVideos.length}/6 — MP4, WebM, MOV)`}
                  currentUrl=""
                  allowManualUrl={false}
                  onUploaded={(url) => {
                    if (!url) return;
                    setForm((f) => ({
                      ...f,
                      galleryVideos: [...f.galleryVideos, url].slice(0, 6),
                    }));
                  }}
                />

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="Or paste video link (Direct MP4/WebM, YouTube, or Vimeo URL)"
                    className="flex-1 min-w-[220px] px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#315E9B]"
                  />
                  <button
                    type="button"
                    onClick={handleAddVideoLink}
                    disabled={form.galleryVideos.length >= 6 || !videoUrlInput.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#202124] bg-white hover:bg-[#E5E7EB]/50 border border-[#E5E7EB] rounded-lg disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    <Link2 className="w-3.5 h-3.5 text-[#315E9B]" />
                    <span>Add Video Link</span>
                  </button>
                </div>

                {form.galleryVideos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {form.galleryVideos.map((vidUrl, idx) => (
                      <div
                        key={`${vidUrl}-${idx}`}
                        className="relative overflow-hidden aspect-video rounded-lg bg-[#111827]"
                      >
                        <MediaVideo
                          src={vidUrl}
                          title={`Project video ${idx + 1}`}
                          controls
                          className="w-full h-full object-contain bg-[#111827]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              galleryVideos: f.galleryVideos.filter((_, i) => i !== idx),
                            }))
                          }
                          aria-label="Remove project video"
                          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-md bg-white/95 text-red-700 flex items-center justify-center border border-[#E5E7EB] cursor-pointer shadow-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-[#202124] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                    className="w-4 h-4 accent-[#315E9B]"
                  />
                  <span>Published (visible to public visitors)</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-[#6B7280]">Order:</label>
                  <input
                    type="number"
                    min={1}
                    value={form.displayOrder}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, displayOrder: Number(e.target.value) || 1 }))
                    }
                    className="w-16 px-2 py-1 text-sm border border-[#E5E7EB] rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#202124] border border-[#E5E7EB] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] disabled:opacity-60 rounded-lg cursor-pointer"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Project' : 'Publish Project'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">
          <p className="text-sm font-medium text-[#202124] mb-1">
            No portfolio projects stored in Firestore yet
          </p>
          <p className="text-xs text-[#6B7280] mb-5 max-w-md mx-auto">
            Add a brand-new project above or load the 4 starter project slots into Firestore so you
            can edit them directly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#315E9B] hover:bg-[#264B7D] rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Project</span>
            </button>
            <button
              type="button"
              onClick={handleLoadStarters}
              disabled={importingStarters}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#202124] bg-[#F7F8FA] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB] disabled:opacity-60 rounded-lg cursor-pointer"
            >
              <span>{importingStarters ? 'Loading...' : 'Load Starter Project Slots'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p, idx) => {
            const thumbImg = p.coverImageUrl || p.galleryImages?.[0] || '';
            const thumbVideo = p.galleryVideos?.[0] || '';
            const videoCount = p.galleryVideos?.length || 0;

            return (
              <div
                key={p.id}
                className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-14 overflow-hidden shrink-0">
                    {thumbImg ? (
                      <img
                        src={thumbImg}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : thumbVideo ? (
                      <MediaVideo
                        src={thumbVideo}
                        title={p.title}
                        thumbnailOnly
                        className="w-full h-full object-cover bg-[#111827]"
                      />
                    ) : (
                      <ProjectPlaceholderVisual categoryName={p.categoryName} compact />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#6B7280] truncate">
                      {p.categoryName} ·{' '}
                      <span
                        className={
                          p.published ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'
                        }
                      >
                        {p.published ? 'Published' : 'Draft'}
                      </span>
                      {videoCount > 0 && (
                        <span>
                          {' '}
                          · {videoCount} {videoCount === 1 ? 'Video' : 'Videos'}
                        </span>
                      )}
                    </p>
                    <h4 className="font-display text-sm font-bold text-[#202124] truncate">
                      {p.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, -1)}
                    disabled={idx === 0}
                    title="Move up"
                    className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#202124] disabled:opacity-40 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, 1)}
                    disabled={idx === projects.length - 1}
                    title="Move down"
                    className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#202124] disabled:opacity-40 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTogglePublished(p)}
                    title={p.published ? 'Unpublish' : 'Publish'}
                    className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#315E9B] cursor-pointer"
                  >
                    {p.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    title="Edit project"
                    className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#315E9B] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(p)}
                    title="Delete project"
                    className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-[#202124]/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-display text-lg font-bold text-[#202124] mb-2">
              Confirm Project Deletion
            </h3>
            <p className="text-sm text-[#6B7280] mb-6">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-[#202124]">{deleteTarget.title}</span>? This
              action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-[#202124] border border-[#E5E7EB] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
