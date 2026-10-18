import React from 'react';
import { useCV } from '../../context/CVContext';
import { useTranslation } from '../../i18n';
import { TemplateId, FontStyle, Density, PhotoShape } from '../../types/cv';
import { Palette, Type, Sliders, Image as ImageIcon, Sparkles } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Navy Blue', hex: '#1e3a8a' },
  { name: 'Royal Indigo', hex: '#4338ca' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Slate Charcoal', hex: '#334155' },
  { name: 'Burgundy', hex: '#991b1b' },
  { name: 'Teal', hex: '#0f766e' },
  { name: 'Bronze Amber', hex: '#b45309' },
  { name: 'Pure Dark', hex: '#0f172a' },
];

export const AppearanceForm: React.FC = () => {
  const { config, updateConfig } = useCV();
  const { t } = useTranslation();

  const templates: { id: TemplateId; label: string }[] = [
    { id: 'modern', label: t('templates.modern.name', 'Moderne') },
    { id: 'classic', label: t('templates.classic.name', 'Classique') },
    { id: 'creative', label: t('templates.creative.name', 'Créatif') },
    { id: 'minimalist', label: t('templates.minimalist.name', 'Minimaliste') },
    { id: 'executive', label: t('templates.executive.name', 'Exécutif') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          {t('builder.appearance', 'Style & Apparence')}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Personnalisez les couleurs, typographies et marges de votre CV.
        </p>
      </div>

      {/* 1. Template Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>{t('builder.template', 'Modèle de CV')}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {templates.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => updateConfig({ templateId: tmpl.id })}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-all ${
                config.templateId === tmpl.id
                  ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {tmpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Color Palette */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-blue-600" />
          <span>{t('builder.accentColor', 'Couleur d’accent')}</span>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => updateConfig({ primaryColor: c.hex })}
              className={`w-7 h-7 rounded-full transition-transform border-2 flex items-center justify-center ${
                config.primaryColor.toLowerCase() === c.hex.toLowerCase()
                  ? 'scale-110 border-white ring-2 ring-blue-600'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
          {/* Custom color input */}
          <div className="flex items-center gap-1.5 ml-2">
            <input
              type="color"
              value={config.primaryColor}
              onChange={(e) => updateConfig({ primaryColor: e.target.value })}
              className="w-7 h-7 p-0 border border-slate-300 rounded cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-500 uppercase">
              {config.primaryColor}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Typography */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-blue-600" />
          <span>{t('builder.font', 'Typographie')}</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'sans' as FontStyle, label: 'Moderne (Sans)', font: 'font-sans' },
            { id: 'serif' as FontStyle, label: 'Élégant (Serif)', font: 'font-serif-cv' },
            { id: 'mono' as FontStyle, label: 'Tech (Mono)', font: 'font-mono-cv' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => updateConfig({ fontStyle: f.id })}
              className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                config.fontStyle === f.id
                  ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={f.font}>{f.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Density / Spacing */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-blue-600" />
          <span>{t('builder.density', 'Densité & Espacement')}</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'compact' as Density, label: t('builder.compact', 'Compact') },
            { id: 'normal' as Density, label: t('builder.normal', 'Normal') },
            { id: 'spacious' as Density, label: t('builder.spacious', 'Aéré') },
          ].map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => updateConfig({ density: d.id })}
              className={`py-2 px-3 rounded-lg border text-xs text-center transition-all ${
                config.density === d.id
                  ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Photo Options */}
      <div className="space-y-3 pt-3 border-t border-slate-200">
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>Options de la photo</span>
        </label>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-700 font-medium">
            {t('builder.showPhoto', 'Afficher la photo')}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.showPhoto}
              onChange={(e) => updateConfig({ showPhoto: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        {config.showPhoto && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 font-medium mr-2">
              {t('builder.photoShape', 'Forme :')}
            </span>
            {[
              { id: 'circle' as PhotoShape, label: t('builder.circle', 'Ronde') },
              { id: 'rounded' as PhotoShape, label: t('builder.rounded', 'Adoucie') },
              { id: 'square' as PhotoShape, label: t('builder.square', 'Carrée') },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => updateConfig({ photoShape: s.id })}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  config.photoShape === s.id
                    ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
