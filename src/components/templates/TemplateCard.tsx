import React from 'react';
import { TemplateId } from '../../types/cv';
import { useTranslation } from '../../i18n';
import { Check } from 'lucide-react';

interface TemplateCardProps {
  id: TemplateId;
  name: string;
  description: string;
  isActive: boolean;
  onSelect: (id: TemplateId) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  id,
  name,
  description,
  isActive,
  onSelect,
}) => {
  const { t } = useTranslation();

  // Visual thumbnail representation of each template layout
  const renderLayoutMiniature = () => {
    switch (id) {
      case 'modern':
        return (
          <div className="w-full h-44 bg-slate-100 rounded border border-slate-200 flex overflow-hidden p-1 gap-1">
            {/* Sidebar */}
            <div className="w-1/3 bg-blue-900 rounded-sm p-1.5 flex flex-col gap-1.5">
              <div className="w-6 h-6 rounded-full bg-white/40 mx-auto" />
              <div className="w-full h-1 bg-white/60 rounded" />
              <div className="w-3/4 h-1 bg-white/40 rounded" />
              <div className="mt-2 space-y-1">
                <div className="w-full h-0.5 bg-white/40 rounded" />
                <div className="w-4/5 h-0.5 bg-white/30 rounded" />
                <div className="w-2/3 h-0.5 bg-white/30 rounded" />
              </div>
            </div>
            {/* Main */}
            <div className="w-2/3 bg-white rounded-sm p-2 flex flex-col gap-2">
              <div className="w-3/4 h-2.5 bg-slate-800 rounded" />
              <div className="w-1/2 h-1 bg-blue-600 rounded" />
              <div className="w-full h-0.5 bg-slate-200 mt-1" />
              <div className="space-y-1">
                <div className="w-full h-1 bg-slate-300 rounded" />
                <div className="w-5/6 h-1 bg-slate-200 rounded" />
                <div className="w-4/5 h-1 bg-slate-200 rounded" />
              </div>
              <div className="w-full h-0.5 bg-slate-200 mt-1" />
              <div className="space-y-1">
                <div className="w-2/3 h-1 bg-slate-300 rounded" />
                <div className="w-full h-1 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        );

      case 'classic':
        return (
          <div className="w-full h-44 bg-white rounded border border-slate-200 p-2.5 flex flex-col gap-2 shadow-xs">
            {/* Centered header */}
            <div className="flex flex-col items-center gap-1 pb-1.5 border-b border-slate-400">
              <div className="w-28 h-2.5 bg-slate-900 rounded" />
              <div className="w-16 h-1 bg-slate-500 rounded" />
              <div className="flex gap-1 mt-0.5">
                <div className="w-8 h-0.5 bg-slate-300 rounded" />
                <div className="w-8 h-0.5 bg-slate-300 rounded" />
                <div className="w-8 h-0.5 bg-slate-300 rounded" />
              </div>
            </div>
            {/* Section 1 */}
            <div className="space-y-1">
              <div className="w-1/3 h-1.5 bg-slate-800 border-b border-slate-300 pb-0.5" />
              <div className="w-full h-1 bg-slate-200 rounded" />
              <div className="w-5/6 h-1 bg-slate-200 rounded" />
            </div>
            {/* Section 2 */}
            <div className="space-y-1">
              <div className="w-1/3 h-1.5 bg-slate-800 border-b border-slate-300 pb-0.5" />
              <div className="w-full h-1 bg-slate-300 rounded" />
              <div className="w-4/5 h-1 bg-slate-200 rounded" />
              <div className="w-3/4 h-1 bg-slate-200 rounded" />
            </div>
          </div>
        );

      case 'creative':
        return (
          <div className="w-full h-44 bg-white rounded border border-slate-200 flex flex-col overflow-hidden shadow-xs">
            {/* Asymmetric Header */}
            <div className="w-full h-12 bg-indigo-700 p-2 flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white/30 shrink-0" />
              <div className="flex flex-col gap-1">
                <div className="w-20 h-2 bg-white rounded" />
                <div className="w-14 h-1 bg-white/70 rounded" />
              </div>
            </div>
            {/* Body 2 columns */}
            <div className="p-2 flex gap-2 flex-1">
              <div className="w-7/12 space-y-1.5">
                <div className="w-16 h-1.5 bg-indigo-600 rounded" />
                <div className="w-full h-1 bg-slate-200 rounded" />
                <div className="w-5/6 h-1 bg-slate-200 rounded" />
                <div className="w-16 h-1.5 bg-indigo-600 rounded mt-1.5" />
                <div className="w-full h-1 bg-slate-200 rounded" />
              </div>
              <div className="w-5/12 bg-slate-50 p-1.5 rounded space-y-1 border border-slate-100">
                <div className="w-12 h-1 bg-indigo-500 rounded" />
                <div className="w-full h-1 bg-slate-300 rounded" />
                <div className="w-4/5 h-1 bg-slate-300 rounded" />
                <div className="w-2/3 h-1 bg-slate-300 rounded" />
              </div>
            </div>
          </div>
        );

      case 'minimalist':
        return (
          <div className="w-full h-44 bg-white rounded border border-slate-200 p-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-1 pb-2 border-b border-slate-100">
              <div className="w-24 h-2 bg-neutral-900 rounded-xs" />
              <div className="w-16 h-1 bg-neutral-400 rounded-xs" />
              <div className="w-32 h-0.5 bg-neutral-300 rounded-xs" />
            </div>
            <div className="space-y-1.5">
              <div className="w-12 h-1 bg-neutral-400 uppercase tracking-widest" />
              <div className="w-full h-1 bg-neutral-200" />
              <div className="w-4/5 h-1 bg-neutral-200" />
            </div>
            <div className="space-y-1.5">
              <div className="w-12 h-1 bg-neutral-400 uppercase tracking-widest" />
              <div className="w-full h-1 bg-neutral-200" />
              <div className="w-3/4 h-1 bg-neutral-200" />
            </div>
            <div className="flex gap-2">
              <div className="w-10 h-1 bg-neutral-300" />
              <div className="w-10 h-1 bg-neutral-300" />
              <div className="w-10 h-1 bg-neutral-300" />
            </div>
          </div>
        );

      case 'executive':
        return (
          <div className="w-full h-44 bg-white rounded border border-slate-200 flex flex-col overflow-hidden shadow-xs">
            {/* Top Bar */}
            <div className="w-full bg-slate-900 p-2 border-b-2 border-amber-600 flex justify-between items-center">
              <div>
                <div className="w-20 h-2 bg-white rounded" />
                <div className="w-12 h-1 bg-sky-300 rounded mt-0.5" />
              </div>
              <div className="w-5 h-5 rounded bg-slate-700" />
            </div>
            {/* Body */}
            <div className="p-2 flex gap-2 flex-1">
              <div className="w-2/3 space-y-1.5">
                <div className="w-14 h-1.5 bg-slate-900 border-b border-amber-500 pb-0.5" />
                <div className="w-full h-1 bg-slate-200 rounded" />
                <div className="w-5/6 h-1 bg-slate-200 rounded" />
                <div className="w-14 h-1.5 bg-slate-900 border-b border-amber-500 pb-0.5 mt-1" />
                <div className="w-full h-1 bg-slate-200 rounded" />
              </div>
              <div className="w-1/3 bg-slate-50 p-1.5 rounded space-y-1 border border-slate-200">
                <div className="w-10 h-1 bg-slate-700 rounded" />
                <div className="w-full h-0.5 bg-slate-300 rounded" />
                <div className="w-4/5 h-0.5 bg-slate-300 rounded" />
                <div className="w-10 h-1 bg-slate-700 rounded mt-1" />
                <div className="w-full h-0.5 bg-slate-300 rounded" />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(id)}
      className={`group relative rounded-xl p-3 cursor-pointer transition-all duration-200 border-2 text-left bg-white dark:bg-slate-900 flex flex-col justify-between ${
        isActive
          ? 'border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-600/20 dark:ring-blue-500/20'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
      }`}
    >
      <div>
        <div className="relative mb-3">
          {renderLayoutMiniature()}
          {isActive && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-sm">
              <Check className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {name}
          </h3>
          {isActive && (
            <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded">
              {t('templates.current', 'Actif')}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(id);
          }}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {isActive ? t('templates.current', 'Modèle actif') : t('templates.useThis', 'Choisir')}
        </button>
      </div>
    </div>
  );
};
