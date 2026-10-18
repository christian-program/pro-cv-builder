import React, { useState, useRef } from 'react';
import { useCV } from '../../context/CVContext';
import { useTranslation } from '../../i18n';
import { CVRenderer } from '../templates/CVRenderer';
import { TemplateId } from '../../types/cv';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCheck,
  Loader2,
  Palette,
  Pipette,
} from 'lucide-react';

const PRESET_ACCENT_COLORS = [
  { name: 'Navy Blue', hex: '#1e3a8a' },
  { name: 'Royal Indigo', hex: '#4338ca' },
  { name: 'Forest Emerald', hex: '#059669' },
  { name: 'Slate Charcoal', hex: '#334155' },
  { name: 'Crimson Burgundy', hex: '#991b1b' },
  { name: 'Ocean Teal', hex: '#0f766e' },
  { name: 'Bronze Amber', hex: '#b45309' },
  { name: 'Elegant Violet', hex: '#7c3aed' },
  { name: 'Rose Coral', hex: '#e11d48' },
  { name: 'Pitch Dark', hex: '#0f172a' },
];

export const CVPreviewPanel: React.FC = () => {
  const { cvData, config, updateConfig } = useCV();
  const { t } = useTranslation();
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [customHexInput, setCustomHexInput] = useState<string>(config.primaryColor);
  const previewRef = useRef<HTMLDivElement>(null);

  const templateOptions: { id: TemplateId; label: string }[] = [
    { id: 'modern', label: t('templates.modern.name', 'Moderne') },
    { id: 'classic', label: t('templates.classic.name', 'Classique') },
    { id: 'creative', label: t('templates.creative.name', 'Créatif') },
    { id: 'minimalist', label: t('templates.minimalist.name', 'Minimaliste') },
    { id: 'executive', label: t('templates.executive.name', 'Exécutif') },
  ];

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(1.2, Math.max(0.5, +(prev + delta).toFixed(2))));
  };

  const handleFit = () => {
    setZoomLevel(0.8);
  };

  const handleColorChange = (newColor: string) => {
    updateConfig({ primaryColor: newColor });
    setCustomHexInput(newColor);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomHexInput(val);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
      updateConfig({ primaryColor: val });
    }
  };

  // High quality client-side PDF export using html2canvas and jsPDF
  const exportToPdf = async () => {
    const element = document.getElementById('printable-cv-area');
    if (!element) return;

    try {
      setIsExporting(true);

      const originalTransform = element.style.transform;
      element.style.transform = 'none';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794,
      });

      element.style.transform = originalTransform;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      const fileName = cvData.personal.fullName
        ? `CV_${cvData.personal.fullName.replace(/\s+/g, '_')}.pdf`
        : 'Mon_CV.pdf';

      pdf.save(fileName);
    } catch (err) {
      console.error('Failed to export PDF', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* 1. Top Controls Bar: Templates & Export Actions */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Template Quick Switcher Chips */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {templateOptions.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => updateConfig({ templateId: tmpl.id })}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                config.templateId === tmpl.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tmpl.label}
            </button>
          ))}
        </div>

        {/* Zoom Controls & Export Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom Buttons */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleZoom(-0.1)}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-1.5 tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => handleZoom(0.1)}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFit}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded transition-colors border-l border-slate-200 dark:border-slate-700 ml-0.5"
              title={t('preview.fit', 'Ajuster')}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Print Button */}
          <button
            type="button"
            onClick={triggerPrint}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            title={t('app.print', 'Imprimer')}
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span className="hidden md:inline">{t('app.print', 'Imprimer')}</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={exportToPdf}
            disabled={isExporting}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('app.generatingPdf', 'Génération...')}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{t('app.downloadPdf', 'Télécharger PDF')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Real-Time Accent Color Picker Toolbar */}
      <div className="px-3 py-2 bg-slate-50/90 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Palette className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Couleur d'accent :</span>
          </div>

          {/* Preset Swatches */}
          <div className="flex items-center gap-1.5">
            {PRESET_ACCENT_COLORS.map((c) => {
              const isSelected = config.primaryColor.toLowerCase() === c.hex.toLowerCase();
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => handleColorChange(c.hex)}
                  className={`w-5 h-5 rounded-full transition-all border ${
                    isSelected
                      ? 'scale-125 ring-2 ring-blue-600 ring-offset-1 border-white shadow-xs'
                      : 'border-black/10 dark:border-white/20 hover:scale-110 opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={`${c.name} (${c.hex})`}
                  aria-label={c.name}
                />
              );
            })}
          </div>

          {/* Custom Color Picker with live preview */}
          <div className="flex items-center gap-1.5 border-l border-slate-300 dark:border-slate-700 pl-2 ml-1">
            <div className="relative flex items-center">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-6 h-6 p-0 border border-slate-300 dark:border-slate-700 rounded cursor-pointer overflow-hidden shadow-2xs"
                title="Choisir une couleur personnalisée"
                id="live-accent-color-picker"
              />
            </div>
            <input
              type="text"
              value={customHexInput}
              onChange={handleHexInputChange}
              placeholder="#1E3A8A"
              maxLength={7}
              className="w-18 px-1.5 py-0.5 text-[11px] font-mono font-semibold uppercase bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-200"
              title="Code hexadécimal"
            />
          </div>
        </div>

        <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden xl:inline">
          Modifie instantanément en-têtes, bordures et jauges
        </span>
      </div>

      {/* 3. A4 Paper Viewport Container */}
      <div
        ref={previewRef}
        className="flex-1 overflow-auto p-4 sm:p-6 flex items-start justify-center bg-slate-200/70 dark:bg-slate-950/90 transition-colors"
      >
        <div
          className="transition-transform duration-200 origin-top shadow-xl rounded-sm print:shadow-none print:transform-none"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <CVRenderer data={cvData} config={config} />
        </div>
      </div>

      {/* 4. Footer Hint */}
      <div className="px-4 py-2 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
        <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{t('preview.tip', 'Format standard A4 · Export haute résolution')}</span>
      </div>
    </div>
  );
};
