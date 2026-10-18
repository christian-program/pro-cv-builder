import React from 'react';
import { useCV } from '../../context/CVContext';
import { useTranslation } from '../../i18n';
import { Plus, Trash2, Languages as LanguagesIcon } from 'lucide-react';

export const LanguagesForm: React.FC = () => {
  const { cvData, addLanguage, updateLanguage, removeLanguage } = useCV();
  const { t } = useTranslation();
  const { languages } = cvData;

  const levelOptions = [
    { value: t('form.languages.levelOptions.native', 'Langue maternelle'), label: t('form.languages.levelOptions.native', 'Langue maternelle') },
    { value: t('form.languages.levelOptions.fluent', 'Bilingue / Courant (C1/C2)'), label: t('form.languages.levelOptions.fluent', 'Bilingue / Courant (C1/C2)') },
    { value: t('form.languages.levelOptions.intermediate', 'Intermédiaire (B1/B2)'), label: t('form.languages.levelOptions.intermediate', 'Intermédiaire (B1/B2)') },
    { value: t('form.languages.levelOptions.basic', 'Élémentaire (A1/A2)'), label: t('form.languages.levelOptions.basic', 'Élémentaire (A1/A2)') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {t('form.languages.title', 'Langues parlées')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('form.languages.subtitle', 'Précisez vos langues et votre niveau de maîtrise.')}
          </p>
        </div>
        <button
          type="button"
          onClick={addLanguage}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('form.languages.add', 'Ajouter')}</span>
        </button>
      </div>

      {languages.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
          <LanguagesIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 mb-3">
            {t('form.languages.empty', 'Aucune langue renseignée.')}
          </p>
          <button
            type="button"
            onClick={addLanguage}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('form.languages.add', 'Ajouter une langue')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {languages.map((lang) => (
            <div
              key={lang.id}
              className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between"
            >
              <div className="w-full sm:w-1/2">
                <input
                  type="text"
                  value={lang.name}
                  onChange={(e) => updateLanguage(lang.id, { name: e.target.value })}
                  placeholder={t('form.languages.namePlaceholder', 'ex: Français, Anglais...')}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="w-full sm:w-1/2 flex items-center gap-2">
                <select
                  value={lang.level}
                  onChange={(e) => updateLanguage(lang.id, { level: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                >
                  <option value="">Sélectionner le niveau</option>
                  {levelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                  {/* Keep current custom value if not in preset */}
                  {lang.level && !levelOptions.some((o) => o.value === lang.level) && (
                    <option value={lang.level}>{lang.level}</option>
                  )}
                </select>

                <button
                  type="button"
                  onClick={() => removeLanguage(lang.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
