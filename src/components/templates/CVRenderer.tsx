import React from 'react';
import { CVData, CVConfig } from '../../types/cv';
import { useTranslation } from '../../i18n';
import { ModernTemplate } from './ModernTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { MinimalistTemplate } from './MinimalistTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';

interface CVRendererProps {
  data: CVData;
  config: CVConfig;
  className?: string;
}

export const CVRenderer: React.FC<CVRendererProps> = ({ data, config, className = '' }) => {
  const { t } = useTranslation();

  const labels = {
    profile: t('preview.sections.profile', 'Profil'),
    experience: t('preview.sections.experience', 'Expérience'),
    education: t('preview.sections.education', 'Formation'),
    skills: t('preview.sections.skills', 'Compétences'),
    languages: t('preview.sections.languages', 'Langues'),
    projects: t('preview.sections.projects', 'Projets'),
    certifications: t('preview.sections.certifications', 'Certifications'),
    interests: t('preview.sections.interests', 'Centres d’intérêt'),
    contact: t('preview.sections.contact', 'Contact'),
  };

  const renderTemplate = () => {
    switch (config.templateId) {
      case 'classic':
        return <ClassicTemplate data={data} config={config} labels={labels} />;
      case 'creative':
        return <CreativeTemplate data={data} config={config} labels={labels} />;
      case 'minimalist':
        return <MinimalistTemplate data={data} config={config} labels={labels} />;
      case 'executive':
        return <ExecutiveTemplate data={data} config={config} labels={labels} />;
      case 'modern':
      default:
        return <ModernTemplate data={data} config={config} labels={labels} />;
    }
  };

  return (
    <div
      id="printable-cv-area"
      className={`w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white transition-all ${className}`}
    >
      {renderTemplate()}
    </div>
  );
};
