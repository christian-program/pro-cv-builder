import React from 'react';
import { TemplateId } from '../../types/cv';
import { useCV } from '../../context/CVContext';
import { useTranslation } from '../../i18n';
import { TemplateCard } from './TemplateCard';
import { LayoutTemplate, Sparkles, ArrowRight } from 'lucide-react';

interface TemplateGalleryProps {
  onContinueToBuilder?: () => void;
  compact?: boolean;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onContinueToBuilder,
  compact = false,
}) => {
  const { config, updateConfig } = useCV();
  const { t } = useTranslation();

  const templatesList: { id: TemplateId; nameKey: string; descKey: string }[] = [
    {
      id: 'modern',
      nameKey: 'templates.modern.name',
      descKey: 'templates.modern.description',
    },
    {
      id: 'classic',
      nameKey: 'templates.classic.name',
      descKey: 'templates.classic.description',
    },
    {
      id: 'creative',
      nameKey: 'templates.creative.name',
      descKey: 'templates.creative.description',
    },
    {
      id: 'minimalist',
      nameKey: 'templates.minimalist.name',
      descKey: 'templates.minimalist.description',
    },
    {
      id: 'executive',
      nameKey: 'templates.executive.name',
      descKey: 'templates.executive.description',
    },
  ];

  const handleSelectTemplate = (id: TemplateId) => {
    updateConfig({ templateId: id });
  };

  return (
    <div className={compact ? 'space-y-4' : 'max-w-6xl mx-auto px-4 py-8'}>
      {!compact && (
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('hero.badge', '100% Gratuit')}</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            {t('templates.title', 'Choisissez votre modèle de CV')}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {t('templates.subtitle', 'Des designs professionnels conçus pour séduire les recruteurs et passer les filtres ATS.')}
          </p>
        </div>
      )}

      <div
        className={`grid gap-4 ${
          compact
            ? 'grid-cols-2 md:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
        }`}
      >
        {templatesList.map((tmpl) => (
          <TemplateCard
            key={tmpl.id}
            id={tmpl.id}
            name={t(tmpl.nameKey)}
            description={t(tmpl.descKey)}
            isActive={config.templateId === tmpl.id}
            onSelect={handleSelectTemplate}
          />
        ))}
      </div>

      {!compact && onContinueToBuilder && (
        <div className="mt-10 text-center">
          <button
            onClick={onContinueToBuilder}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all text-sm group"
          >
            <span>{t('app.createBtn', 'Passer à la personnalisation')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
