import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { useTranslation } from '../../i18n';
import { DraggableItem } from '../common/DraggableItem';
import { Plus, Trash2, FolderGit2, Award, Heart } from 'lucide-react';

export const ExtraForm: React.FC = () => {
  const {
    cvData,
    addProject,
    updateProject,
    removeProject,
    moveProject,
    reorderProjects,
    addCertification,
    updateCertification,
    removeCertification,
    addInterest,
    updateInterest,
    removeInterest,
  } = useCV();
  const { t } = useTranslation();
  const [newInterestInput, setNewInterestInput] = useState('');

  const handleAddInterestKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newInterestInput.trim()) {
      e.preventDefault();
      addInterest(newInterestInput.trim());
      setNewInterestInput('');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          {t('form.extra.title', 'Projets, Certifications & Intérêts')}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('form.extra.subtitle', 'Ajoutez des projets marquants, certifications reconnues ou passions.')}
        </p>
      </div>

      {/* 1. Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FolderGit2 className="w-4 h-4 text-blue-600" />
            <span>{t('form.extra.projectsTitle', 'Projets significatifs')}</span>
          </h3>
          <button
            type="button"
            onClick={addProject}
            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>{t('form.extra.addProject', 'Ajouter un projet')}</span>
          </button>
        </div>

        {cvData.projects.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Aucun projet ajouté pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {cvData.projects.map((proj, index) => (
              <DraggableItem
                key={proj.id}
                id={proj.id}
                index={index}
                total={cvData.projects.length}
                dragType="cv-project"
                onMove={(dir) => moveProject(proj.id, dir)}
                onReorder={reorderProjects}
                onDelete={() => removeProject(proj.id)}
                title={proj.title || t('form.extra.projectTitlePlaceholder', 'Projet')}
              >
                <div className="space-y-2">
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => updateProject(proj.id, { title: e.target.value })}
                    placeholder={t('form.extra.projectTitlePlaceholder', 'Nom du projet')}
                    className="w-full px-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={proj.role || ''}
                      onChange={(e) => updateProject(proj.id, { role: e.target.value })}
                      placeholder={t('form.extra.projectRolePlaceholder', 'Rôle / Stack')}
                      className="px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                    />
                    <input
                      type="text"
                      value={proj.link || ''}
                      onChange={(e) => updateProject(proj.id, { link: e.target.value })}
                      placeholder={t('form.extra.projectLinkPlaceholder', 'Lien (URL)')}
                      className="px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                    placeholder={t('form.extra.projectDescPlaceholder', 'Description courte du projet')}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded"
                  />
                </div>
              </DraggableItem>
            ))}
          </div>
        )}
      </div>

      {/* 2. Certifications */}
      <div className="space-y-4 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>{t('form.extra.certificationsTitle', 'Certifications')}</span>
          </h3>
          <button
            type="button"
            onClick={addCertification}
            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>{t('form.extra.addCert', 'Ajouter une certification')}</span>
          </button>
        </div>

        {cvData.certifications.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Aucune certification ajoutée.</p>
        ) : (
          <div className="space-y-3">
            {cvData.certifications.map((cert) => (
              <div key={cert.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <input
                  type="text"
                  value={cert.title}
                  onChange={(e) => updateCertification(cert.id, { title: e.target.value })}
                  placeholder={t('form.extra.certTitlePlaceholder', 'Titre de la certification')}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded font-semibold"
                />
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                  placeholder={t('form.extra.certIssuerPlaceholder', 'Organisme émetteur (AWS...)')}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) => updateCertification(cert.id, { date: e.target.value })}
                    placeholder={t('form.extra.certDatePlaceholder', 'Année (ex: 2023)')}
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeCertification(cert.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Interests */}
      <div className="space-y-3 pt-2 border-t border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>{t('form.extra.interestsTitle', 'Centres d’intérêt')}</span>
        </h3>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newInterestInput}
            onChange={(e) => setNewInterestInput(e.target.value)}
            onKeyDown={handleAddInterestKey}
            placeholder={t('form.extra.interestPlaceholder', 'Tapez un intérêt et appuyez sur Entrée')}
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => {
              if (newInterestInput.trim()) {
                addInterest(newInterestInput.trim());
                setNewInterestInput('');
              }
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {t('form.extra.addInterest', 'Ajouter')}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {cvData.interests.map((int) => (
            <span
              key={int.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
            >
              <span>{int.name}</span>
              <button
                type="button"
                onClick={() => removeInterest(int.id)}
                className="text-slate-400 hover:text-rose-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
