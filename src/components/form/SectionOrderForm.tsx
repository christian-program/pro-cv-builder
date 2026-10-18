import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { useTranslation } from '../../i18n';
import { SectionId } from '../../types/cv';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  AlignLeft,
  Briefcase,
  GraduationCap,
  Wrench,
  Languages as LanguagesIcon,
  FolderGit2,
  Award,
  Heart,
} from 'lucide-react';
import { DEFAULT_SECTION_ORDER } from '../../context/CVContext';

const SECTION_ICONS: Record<SectionId, React.ComponentType<{ className?: string }>> = {
  summary: AlignLeft,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  languages: LanguagesIcon,
  projects: FolderGit2,
  certifications: Award,
  interests: Heart,
};

export const SectionOrderForm: React.FC = () => {
  const { config, reorderSectionOrder, moveSectionOrder, updateConfig } = useCV();
  const { t } = useTranslation();
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const sectionOrder = config.sectionOrder || DEFAULT_SECTION_ORDER;

  const sectionLabels: Record<SectionId, string> = {
    summary: t('preview.sections.profile', 'Profil & Résumé'),
    experience: t('preview.sections.experience', 'Expériences professionnelles'),
    education: t('preview.sections.education', 'Formation & Diplômes'),
    skills: t('preview.sections.skills', 'Compétences'),
    languages: t('preview.sections.languages', 'Langues'),
    projects: t('preview.sections.projects', 'Projets significatifs'),
    certifications: t('preview.sections.certifications', 'Certifications'),
    interests: t('preview.sections.interests', 'Centres d’intérêt'),
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, type: 'cv-section-order' }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== index) setDragOverIdx(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIdx(null);
    setDraggedIdx(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data && data.type === 'cv-section-order' && typeof data.index === 'number') {
        if (data.index !== targetIndex) {
          reorderSectionOrder(data.index, targetIndex);
        }
      }
    } catch (err) {
      console.error('Section order drop error', err);
    }
  };

  const handleResetOrder = () => {
    updateConfig({ sectionOrder: DEFAULT_SECTION_ORDER });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Ordre des sections du CV</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Glissez-déposez les sections pour réorganiser la mise en page de votre CV en temps réel.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetOrder}
          className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          title="Rétablir l’ordre par défaut"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span className="hidden sm:inline">Par défaut</span>
        </button>
      </div>

      <div className="space-y-2">
        {sectionOrder.map((sectionId, index) => {
          const Icon = SECTION_ICONS[sectionId] || AlignLeft;
          const label = sectionLabels[sectionId] || sectionId;
          const isDragging = draggedIdx === index;
          const isDragOver = dragOverIdx === index;

          return (
            <div
              key={sectionId}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={() => {
                setDraggedIdx(null);
                setDragOverIdx(null);
              }}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 bg-white transition-all cursor-move ${
                isDragging
                  ? 'opacity-40 border-dashed border-blue-400 bg-blue-50/20'
                  : isDragOver
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 scale-[1.01]'
                  : 'border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 rounded transition-colors shrink-0"
                  title="Glisser-déposer pour réordonner"
                >
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  <span className="text-slate-400 font-mono mr-2 tabular-nums">#{index + 1}</span>
                  <span>{label}</span>
                </div>
              </div>

              {/* Accessible Reorder Arrows */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveSectionOrder(sectionId, 'up')}
                  disabled={index === 0}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded transition-colors"
                  title="Monter"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSectionOrder(sectionId, 'down')}
                  disabled={index === sectionOrder.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded transition-colors"
                  title="Descendre"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
