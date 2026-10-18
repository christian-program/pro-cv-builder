import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { useTranslation } from '../../i18n';
import { Plus, Trash2, Wrench, Sparkles, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

const SUGGESTED_SKILLS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'Tailwind CSS',
  'Next.js',
  'PostgreSQL',
  'Docker',
  'Git & GitHub',
  'Figma',
  'Agile / Scrum',
  'Gestion de projet',
  'CI/CD',
];

export const SkillsForm: React.FC = () => {
  const { cvData, addSkill, updateSkill, removeSkill, moveSkill, reorderSkills } = useCV();
  const { t } = useTranslation();
  const { skills } = cvData;
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleAddSuggested = (skillName: string) => {
    if (!skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      addSkill(skillName);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, type: 'cv-skill' }));
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
      if (data && data.type === 'cv-skill' && typeof data.index === 'number') {
        if (data.index !== targetIndex) {
          reorderSkills(data.index, targetIndex);
        }
      }
    } catch (err) {
      console.error('Skill drop error', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {t('form.skills.title', 'Compétences')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Glissez-déposez pour prioriser vos compétences les plus pertinentes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => addSkill('')}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('form.skills.add', 'Ajouter')}</span>
        </button>
      </div>

      {/* Quick Suggestions */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-2">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Suggestions rapides (cliquez pour ajouter) :</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_SKILLS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleAddSuggested(item)}
              className="text-[11px] px-2 py-0.5 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded-md text-slate-700 transition-colors"
            >
              + {item}
            </button>
          ))}
        </div>
      </div>

      {/* Skills list */}
      {skills.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
          <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 mb-3">
            {t('form.skills.empty', 'Aucune compétence renseignée.')}
          </p>
          <button
            type="button"
            onClick={() => addSkill('')}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('form.skills.add', 'Ajouter une compétence')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {skills.map((skill, index) => (
            <div
              key={skill.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={() => {
                setDraggedIdx(null);
                setDragOverIdx(null);
              }}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-2.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-2 justify-between transition-all ${
                draggedIdx === index
                  ? 'opacity-40 border-dashed border-blue-400 bg-blue-50/20'
                  : dragOverIdx === index
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                <div
                  className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 rounded transition-colors shrink-0"
                  title="Glisser-déposer"
                >
                  <GripVertical className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                  placeholder={t('form.skills.namePlaceholder', 'Nom de la compétence')}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Level Selector 1 to 5 + Reorder buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[11px] text-slate-500 font-medium">Niveau :</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => updateSkill(skill.id, { level: lvl })}
                      className={`w-6 h-6 text-[10px] font-bold rounded flex items-center justify-center transition-colors ${
                        skill.level >= lvl
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1.5 ml-1">
                  <button
                    type="button"
                    onClick={() => moveSkill(skill.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-25 rounded"
                    title="Monter"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSkill(skill.id, 'down')}
                    disabled={index === skills.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-25 rounded"
                    title="Descendre"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded ml-1"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
