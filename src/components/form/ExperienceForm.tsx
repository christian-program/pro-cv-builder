import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { useTranslation } from '../../i18n';
import { DraggableItem } from '../common/DraggableItem';
import { Plus, Briefcase, Calendar, MapPin, Building2, Sparkles } from 'lucide-react';
import { AISuggestionModal } from '../common/AISuggestionModal';

export const ExperienceForm: React.FC = () => {
  const {
    cvData,
    addExperience,
    updateExperience,
    removeExperience,
    moveExperience,
    reorderExperiences,
  } = useCV();
  const { t } = useTranslation();
  const { experiences } = cvData;

  const [aiModalState, setAiModalState] = useState<{
    isOpen: boolean;
    expId: string;
    currentText: string;
    position: string;
    company: string;
  }>({
    isOpen: false,
    expId: '',
    currentText: '',
    position: '',
    company: '',
  });

  const skillsList = cvData.skills.map((s) => s.name).filter(Boolean);

  const handleApplyAi = (text: string, mode: 'replace' | 'append') => {
    if (!aiModalState.expId) return;
    const exp = experiences.find((e) => e.id === aiModalState.expId);
    if (!exp) return;

    if (mode === 'append' && exp.description.trim()) {
      updateExperience(aiModalState.expId, {
        description: `${exp.description.trim()}\n• ${text}`,
      });
    } else {
      updateExperience(aiModalState.expId, {
        description: text,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t('form.experience.title', 'Expériences professionnelles')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Glissez-déposez les cartes pour réorganiser l’ordre de vos postes.
          </p>
        </div>
        <button
          type="button"
          onClick={addExperience}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('form.experience.add', 'Ajouter')}</span>
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {t('form.experience.empty', 'Aucune expérience renseignée.')}
          </p>
          <button
            type="button"
            onClick={addExperience}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('form.experience.add', 'Ajouter une première expérience')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, index) => (
            <DraggableItem
              key={exp.id}
              id={exp.id}
              index={index}
              total={experiences.length}
              dragType="cv-experience"
              onMove={(dir) => moveExperience(exp.id, dir)}
              onReorder={reorderExperiences}
              onDelete={() => removeExperience(exp.id)}
              title={
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span>{exp.position || t('form.experience.position', 'Poste')}</span>
                  {exp.company && (
                    <span className="text-slate-400 dark:text-slate-500 font-normal">@ {exp.company}</span>
                  )}
                </span>
              }
            >
              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      <span>{t('form.experience.position', 'Intitulé du poste')}</span>
                    </label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                      placeholder={t('form.experience.positionPlaceholder', 'ex: Lead Tech Frontend')}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{t('form.experience.company', 'Entreprise')}</span>
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                      placeholder={t('form.experience.companyPlaceholder', 'ex: Doctolib, Freelance')}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{t('form.experience.location', 'Lieu')}</span>
                    </label>
                    <input
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                      placeholder={t('form.experience.locationPlaceholder', 'ex: Paris, France')}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Dates (Début – Fin)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                        placeholder="ex: 2021"
                        className="w-1/2 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                      />
                      <span className="text-slate-400">–</span>
                      <input
                        type="text"
                        disabled={exp.isCurrent}
                        value={exp.isCurrent ? 'Présent' : exp.endDate}
                        onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                        placeholder="ex: 2024"
                        className="w-1/2 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-400 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </div>
                    <label className="inline-flex items-center gap-1.5 mt-1.5 cursor-pointer text-[11px] text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={exp.isCurrent}
                        onChange={(e) =>
                          updateExperience(exp.id, {
                            isCurrent: e.target.checked,
                            endDate: e.target.checked ? 'Présent' : '',
                          })
                        }
                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-800"
                      />
                      <span>{t('form.experience.current', 'Poste actuel')}</span>
                    </label>
                  </div>
                </div>

                {/* Description with AI Assistant Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {t('form.experience.description', 'Missions & Réalisations clés')}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setAiModalState({
                          isOpen: true,
                          expId: exp.id,
                          currentText: exp.description,
                          position: exp.position,
                          company: exp.company,
                        })
                      }
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-md transition-colors"
                      title="Suggérer ou reformuler des puces de réalisations"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Suggérer avec l'IA</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                    placeholder={t(
                      'form.experience.descriptionPlaceholder',
                      '• Encadrement d’une équipe de 5 ingénieurs\n• Refonte UX...'
                    )}
                    className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 leading-relaxed font-mono-cv transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>
            </DraggableItem>
          ))}
        </div>
      )}

      {/* AI Suggestion Modal */}
      <AISuggestionModal
        isOpen={aiModalState.isOpen}
        onClose={() => setAiModalState((prev) => ({ ...prev, isOpen: false }))}
        onApply={handleApplyAi}
        field="experience"
        currentText={aiModalState.currentText}
        context={{
          jobTitle: aiModalState.position || cvData.personal.title,
          company: aiModalState.company,
          skills: skillsList,
        }}
      />
    </div>
  );
};
