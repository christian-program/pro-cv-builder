import React from 'react';
import { useCV } from '../../context/CVContext';
import { useTranslation } from '../../i18n';
import { PersonalInfoForm } from './PersonalInfoForm';
import { SummaryForm } from './SummaryForm';
import { ExperienceForm } from './ExperienceForm';
import { EducationForm } from './EducationForm';
import { SkillsForm } from './SkillsForm';
import { LanguagesForm } from './LanguagesForm';
import { ExtraForm } from './ExtraForm';
import { AppearanceForm } from './AppearanceForm';
import { SectionOrderForm } from './SectionOrderForm';
import {
  User,
  AlignLeft,
  Briefcase,
  GraduationCap,
  Wrench,
  Languages as LanguagesIcon,
  FolderGit2,
  Palette,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
} from 'lucide-react';

export const CVFormContainer: React.FC = () => {
  const { activeSection, setActiveSection, cvData } = useCV();
  const { t } = useTranslation();

  const sections = [
    {
      id: 'personal',
      label: t('builder.tabs.personal', 'Infos personnelles'),
      shortLabel: 'Infos',
      icon: User,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      activeColor: 'bg-blue-600 text-white',
      badge: cvData.personal.fullName ? (cvData.personal.title || 'Renseigné') : 'Requis',
      isComplete: Boolean(cvData.personal.fullName && cvData.personal.email),
    },
    {
      id: 'summary',
      label: t('builder.tabs.summary', 'Profil & Résumé'),
      shortLabel: 'Profil',
      icon: AlignLeft,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      activeColor: 'bg-indigo-600 text-white',
      badge: cvData.summary.trim() ? `${cvData.summary.split(/\s+/).filter(Boolean).length} mots` : 'Optionnel',
      isComplete: Boolean(cvData.summary.trim()),
    },
    {
      id: 'experience',
      label: t('builder.tabs.experience', 'Expériences'),
      shortLabel: 'Expériences',
      icon: Briefcase,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      activeColor: 'bg-sky-600 text-white',
      badge: `${cvData.experiences.length} ${cvData.experiences.length > 1 ? 'postes' : 'poste'}`,
      isComplete: cvData.experiences.length > 0,
    },
    {
      id: 'education',
      label: t('builder.tabs.education', 'Formation'),
      shortLabel: 'Formation',
      icon: GraduationCap,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      activeColor: 'bg-purple-600 text-white',
      badge: `${cvData.education.length} ${cvData.education.length > 1 ? 'diplômes' : 'diplôme'}`,
      isComplete: cvData.education.length > 0,
    },
    {
      id: 'skills',
      label: t('builder.tabs.skills', 'Compétences'),
      shortLabel: 'Compétences',
      icon: Wrench,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      activeColor: 'bg-emerald-600 text-white',
      badge: `${cvData.skills.length} ${cvData.skills.length > 1 ? 'compétences' : 'compétence'}`,
      isComplete: cvData.skills.length > 0,
    },
    {
      id: 'languages',
      label: t('builder.tabs.languages', 'Langues'),
      shortLabel: 'Langues',
      icon: LanguagesIcon,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      activeColor: 'bg-amber-600 text-white',
      badge: `${cvData.languages.length} ${cvData.languages.length > 1 ? 'langues' : 'langue'}`,
      isComplete: cvData.languages.length > 0,
    },
    {
      id: 'extra',
      label: t('builder.tabs.extra', 'Projets & Certifs'),
      shortLabel: 'Projets',
      icon: FolderGit2,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      activeColor: 'bg-rose-600 text-white',
      badge: `${cvData.projects.length + cvData.certifications.length} éléments`,
      isComplete: cvData.projects.length > 0 || cvData.certifications.length > 0,
    },
    {
      id: 'sectionOrder',
      label: 'Ordre des sections',
      shortLabel: 'Ordre',
      icon: ListOrdered,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
      activeColor: 'bg-violet-600 text-white',
      badge: 'Glisser-déposer',
      isComplete: true,
    },
    {
      id: 'appearance',
      label: t('builder.appearance', 'Style & Modèle'),
      shortLabel: 'Style',
      icon: Palette,
      color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200',
      activeColor: 'bg-fuchsia-600 text-white',
      badge: 'Couleurs & Police',
      isComplete: true,
    },
  ];

  const currentIndex = sections.findIndex((s) => s.id === activeSection);
  const completedCount = sections.filter((s) => s.isComplete).length;
  const progressPercent = Math.round((completedCount / sections.length) * 100);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  const renderActiveSectionContent = () => {
    switch (activeSection) {
      case 'summary':
        return <SummaryForm />;
      case 'experience':
        return <ExperienceForm />;
      case 'education':
        return <EducationForm />;
      case 'skills':
        return <SkillsForm />;
      case 'languages':
        return <LanguagesForm />;
      case 'extra':
        return <ExtraForm />;
      case 'sectionOrder':
        return <SectionOrderForm />;
      case 'appearance':
        return <AppearanceForm />;
      case 'personal':
      default:
        return <PersonalInfoForm />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row h-full overflow-hidden min-h-[640px] transition-colors">
      {/* 1. Desktop Vertical Navigation Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-slate-50/90 dark:bg-slate-950/70 border-r border-slate-200/90 dark:border-slate-800 p-3 select-none">
        {/* Sidebar Header with Completion Progress */}
        <div className="mb-3 px-2 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Complétion</span>
            </span>
            <span className="tabular-nums text-blue-700 dark:text-blue-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Section Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar pr-0.5">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`w-full group flex items-center justify-between p-2 rounded-xl text-left transition-all text-xs font-semibold ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs ring-1 ring-slate-200/90 dark:ring-slate-700 border-l-4 border-l-blue-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Visual Icon Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? sec.activeColor : `${sec.color} dark:bg-opacity-20`
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Title & Subtitle */}
                  <div className="min-w-0">
                    <div className="truncate leading-tight font-bold text-[11.5px]">
                      {sec.label}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate mt-0.5">
                      {sec.badge}
                    </div>
                  </div>
                </div>

                {/* Completion checkmark */}
                {sec.isComplete && (
                  <div className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 ml-1">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 2. Mobile Responsive Horizontal Header Bar */}
      <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/70 px-2 py-2 overflow-x-auto no-scrollbar">
        <div className="flex gap-1.5 min-w-max">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-2xs border border-blue-200 dark:border-blue-800 ring-1 ring-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/60 dark:bg-slate-800/60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    isActive ? sec.activeColor : `${sec.color} dark:bg-opacity-20`
                  }`}
                >
                  <Icon className="w-3 h-3" />
                </div>
                <span>{sec.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Form Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto max-h-[calc(100vh-210px)]">
          {renderActiveSectionContent()}
        </div>

        {/* Bottom Step Navigation Bar */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Précédent</span>
          </button>

          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tabular-nums">
            Étape {currentIndex + 1} / {sections.length}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === sections.length - 1}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Suivant</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
