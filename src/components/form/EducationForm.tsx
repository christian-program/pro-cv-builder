import React from 'react';
import { useCV } from '../../context/CVContext';
import { useTranslation } from '../../i18n';
import { DraggableItem } from '../common/DraggableItem';
import { Plus, GraduationCap, Calendar, MapPin, Building } from 'lucide-react';

export const EducationForm: React.FC = () => {
  const {
    cvData,
    addEducation,
    updateEducation,
    removeEducation,
    moveEducation,
    reorderEducation,
  } = useCV();
  const { t } = useTranslation();
  const { education } = cvData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {t('form.education.title', 'Formation & Diplômes')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Glissez-déposez les cartes pour réorganiser l’ordre de vos diplômes.
          </p>
        </div>
        <button
          type="button"
          onClick={addEducation}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('form.education.add', 'Ajouter')}</span>
        </button>
      </div>

      {education.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 mb-3">
            {t('form.education.empty', 'Aucune formation renseignée.')}
          </p>
          <button
            type="button"
            onClick={addEducation}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('form.education.add', 'Ajouter une formation')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu, index) => (
            <DraggableItem
              key={edu.id}
              id={edu.id}
              index={index}
              total={education.length}
              dragType="cv-education"
              onMove={(dir) => moveEducation(edu.id, dir)}
              onReorder={reorderEducation}
              onDelete={() => removeEducation(edu.id)}
              title={
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span>{edu.degree || t('form.education.degree', 'Diplôme')}</span>
                  {edu.institution && (
                    <span className="text-slate-400 font-normal">@ {edu.institution}</span>
                  )}
                </span>
              }
            >
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-slate-400" />
                      <span>{t('form.education.degree', 'Diplôme')}</span>
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                      placeholder={t('form.education.degreePlaceholder', 'ex: Master en Informatique')}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{t('form.education.institution', 'Établissement / Université')}</span>
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                      placeholder={t('form.education.institutionPlaceholder', 'ex: Université Paris-Saclay')}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{t('form.education.location', 'Lieu')}</span>
                    </label>
                    <input
                      type="text"
                      value={edu.location || ''}
                      onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                      placeholder={t('form.education.locationPlaceholder', 'ex: Paris, France')}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Année / Dates</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                        placeholder="Début (ex: 2017)"
                        className="w-1/2 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-slate-400">–</span>
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                        placeholder="Fin (ex: 2019)"
                        className="w-1/2 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {t('form.education.description', 'Détails complémentaires (mention, projet...)')}
                  </label>
                  <input
                    type="text"
                    value={edu.description || ''}
                    onChange={(e) => updateEducation(edu.id, { description: e.target.value })}
                    placeholder={t('form.education.descriptionPlaceholder', 'Mention Très Bien, spécialité...')}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </DraggableItem>
          ))}
        </div>
      )}
    </div>
  );
};
