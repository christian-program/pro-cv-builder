import React, { useState } from 'react';
import { CVFormContainer } from '../form/CVFormContainer';
import { CVPreviewPanel } from '../preview/CVPreviewPanel';
import { useTranslation } from '../../i18n';
import { useCV } from '../../context/CVContext';
import { Edit3, Eye, Sparkles, LayoutTemplate, Palette } from 'lucide-react';

interface BuilderViewProps {
  onOpenTemplates: () => void;
}

export const BuilderView: React.FC<BuilderViewProps> = ({ onOpenTemplates }) => {
  const { t, language } = useTranslation();
  const { config, updateConfig, loadSample } = useCV();
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4">
      {/* Mobile / Tablet Segmented Control */}
      <div className="lg:hidden flex items-center justify-between mb-4 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex w-full gap-1">
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              mobileTab === 'form'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('builder.formTab', 'Édition')}</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              mobileTab === 'preview'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('builder.previewTab', 'Aperçu')}</span>
          </button>
        </div>
      </div>

      {/* Main Builder Grid: Side-by-side balanced 6-6 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Form with Vertical Sidebar */}
        <div
          className={`lg:col-span-6 xl:col-span-6 ${
            mobileTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          <CVFormContainer />
        </div>

        {/* Right Column: Live A4 Preview */}
        <div
          className={`lg:col-span-6 xl:col-span-6 lg:sticky lg:top-20 ${
            mobileTab === 'form' ? 'hidden lg:block' : 'block'
          }`}
        >
          <CVPreviewPanel />
        </div>
      </div>
    </div>
  );
};
