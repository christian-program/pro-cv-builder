import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { useTranslation } from '../../i18n';
import { AlignLeft, HelpCircle, Sparkles } from 'lucide-react';
import { AISuggestionModal } from '../common/AISuggestionModal';

export const SummaryForm: React.FC = () => {
  const { cvData, updateSummary } = useCV();
  const { t } = useTranslation();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Extract relevant context from CV data for AI prompt
  const skillsList = cvData.skills.map((s) => s.name).filter(Boolean);
  const topExp = cvData.experiences[0];
  const topEdu = cvData.education[0];

  const handleApplyAi = (text: string, mode: 'replace' | 'append') => {
    if (mode === 'append' && cvData.summary.trim()) {
      updateSummary(`${cvData.summary.trim()}\n\n${text}`);
    } else {
      updateSummary(text);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          {t('form.summary.title', 'Profil professionnel & Résumé')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t('form.summary.subtitle', 'Présentez en 3 à 5 lignes vos points forts et réalisations majeures.')}
        </p>
      </div>

      <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 p-3 rounded-lg flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
        <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold">Conseil pour un CV percutant :</span> Mettez en avant vos années d'expérience, 2 ou 3 compétences maîtresses et un résultat chiffré marquant (ex: augmentation de performance, taille d'équipe encadrée).
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('form.summary.title', 'Résumé du profil')}</span>
          </label>

          {/* AI Suggestion Trigger Button */}
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg shadow-2xs transition-colors"
            title="Générer ou reformuler avec l'IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Suggérer avec l'IA</span>
          </button>
        </div>

        <textarea
          rows={6}
          value={cvData.summary}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder={t(
            'form.summary.placeholder',
            'Professionnel passionné avec 5 ans d’expérience...'
          )}
          className="w-full p-3 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors leading-relaxed placeholder-slate-400 dark:placeholder-slate-500"
        />
        <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          <span>{cvData.summary ? cvData.summary.split(/\s+/).filter(Boolean).length : 0} mots</span>
          <span>Recommandé : 40 - 80 mots</span>
        </div>
      </div>

      {/* AI Suggestion Modal */}
      <AISuggestionModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApply={handleApplyAi}
        field="summary"
        currentText={cvData.summary}
        context={{
          jobTitle: cvData.personal.title || topExp?.position,
          company: topExp?.company,
          skills: skillsList,
          degree: topEdu?.degree,
          institution: topEdu?.institution,
        }}
      />
    </div>
  );
};
