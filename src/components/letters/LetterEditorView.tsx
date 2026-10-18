import React, { useState } from 'react';
import { useLetter } from '../../context/LetterContext';
import { useCV } from '../../context/CVContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { SignatureManager } from '../signature/SignatureManager';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  Download,
  Printer,
  Save,
  Sparkles,
  ArrowLeft,
  PenTool,
  Check,
  Building2,
  Trash2,
  Loader2,
  ZoomIn,
  ZoomOut,
  Edit2,
  FileCheck,
  X,
  Palette,
  Type,
  AlignLeft,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { exportLetterToPdf } from '../../utils/pdfExport';
import {
  LETTER_TEMPLATES,
  LETTER_FONTS,
  LETTER_SPACINGS,
  LETTER_MARGINS,
  LETTER_FONT_SIZES,
  LETTER_ACCENT_COLORS,
} from '../../data/letterTemplates';
import {
  LetterTemplateId,
  LetterFont,
  LetterSpacing,
  LetterFontSize,
  LetterMargin,
} from '../../types/letter';

interface LetterEditorViewProps {
  onBackToDashboard: () => void;
}

export const LetterEditorView: React.FC<LetterEditorViewProps> = ({
  onBackToDashboard,
}) => {
  const {
    currentLetter,
    updateCurrentLetter,
    saveLetter,
    regenerateCurrentLetter,
    regenerateParagraph,
    isGenerating,
  } = useLetter();
  const { cvData } = useCV();
  const { user } = useAuth();
  const { language, t } = useTranslation();

  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0.9);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isStylingOpen, setIsStylingOpen] = useState(true);

  // Paragraph-level AI refinement state
  const [refiningParaIdx, setRefiningParaIdx] = useState<number | null>(null);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  if (!currentLetter) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm text-slate-500">Aucune lettre sélectionnée.</p>
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
        >
          Retourner au tableau de bord
        </button>
      </div>
    );
  }

  // Active configuration or defaults
  const activeTemplateId: LetterTemplateId = currentLetter.templateId || 'moderne';
  const activeFont: LetterFont = currentLetter.fontFamily || 'sans';
  const activeSpacing: LetterSpacing = currentLetter.spacing || 'normal';
  const activeMargin: LetterMargin = currentLetter.margin || 'normal';
  const activeFontSize: LetterFontSize = currentLetter.fontSize || 'base';
  const activeAccentColor: string =
    currentLetter.accentColor ||
    (activeTemplateId === 'classique' ? '#334155' : activeTemplateId === 'minimaliste' ? '#0f172a' : '#2563eb');

  const selectedFontDef = LETTER_FONTS.find((f) => f.id === activeFont) || LETTER_FONTS[0];
  const selectedSpacingDef = LETTER_SPACINGS.find((s) => s.id === activeSpacing) || LETTER_SPACINGS[1];
  const selectedMarginDef = LETTER_MARGINS.find((m) => m.id === activeMargin) || LETTER_MARGINS[1];
  const selectedFontSizeDef = LETTER_FONT_SIZES.find((fs) => fs.id === activeFontSize) || LETTER_FONT_SIZES[1];

  // Sender details: fallback from CV data
  const senderName = cvData.personal.fullName || 'Alexandre Dupont';
  const senderTitle = cvData.personal.title || '';
  const senderEmail = cvData.personal.email || 'alexandre.dupont@email.com';
  const senderPhone = cvData.personal.phone || '+33 6 12 34 56 78';
  const senderAddress = cvData.personal.address || 'Paris, France';

  // Current formatted date
  const todayFormatted = new Date().toLocaleDateString(
    language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'fr-FR',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  const activeSignature = currentLetter.signatureImageUrl || user?.signatureImageUrl || null;

  // Split paragraphs for editable blocks
  const paragraphs = currentLetter.contenu
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const handleParagraphChange = (index: number, newText: string) => {
    const updated = [...paragraphs];
    updated[index] = newText;
    updateCurrentLetter({ contenu: updated.join('\n\n') });
  };

  const handleManualSave = async () => {
    setIsSaving(true);
    const ok = await saveLetter();
    setIsSaving(false);
    if (ok) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  // Export to PDF with Letter mode & high resolution A4 formatting
  const handleDownloadPdf = async () => {
    if (!currentLetter) return;
    try {
      setIsExportingPdf(true);
      await exportLetterToPdf({
        letter: currentLetter,
        cvData,
        userSignatureUrl: user?.signatureImageUrl,
        elementId: 'printable-letter-sheet',
      });
    } catch (err) {
      console.error('PDF letter export error:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Refine single paragraph with AI
  const handleRefineParagraphSubmit = async (idx: number, instructionText?: string) => {
    setIsRefining(true);
    try {
      const textToRefine = paragraphs[idx];
      const newParagraph = await regenerateParagraph(textToRefine, instructionText || refineInstruction);
      handleParagraphChange(idx, newParagraph);
      setRefiningParaIdx(null);
      setRefineInstruction('');
    } catch (e) {
      console.error('Failed to refine paragraph', e);
    } finally {
      setIsRefining(false);
    }
  };

  const subjectTitle =
    currentLetter.type === 'motivation'
      ? `Candidature au poste de ${currentLetter.poste}`
      : `Demande d'emploi spontanée — ${currentLetter.poste}`;

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* 1. Top Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors no-print">
        {/* Left: Back button & Letter Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            title="Retour au tableau de bord"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {currentLetter.poste}
              </span>
              <span className="text-slate-400">@</span>
              <span className="font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400 truncate">
                {currentLetter.entreprise}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentLetter.type === 'motivation'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                }`}
              >
                {currentLetter.type === 'motivation' ? 'Lettre de motivation' : 'Demande d’emploi'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              Modèle : <span className="capitalize font-semibold text-slate-700 dark:text-slate-200">{activeTemplateId}</span> · Ton : <span className="capitalize font-semibold">{currentLetter.tone || 'Formel'}</span>
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle styling panel */}
          <button
            type="button"
            onClick={() => setIsStylingOpen(!isStylingOpen)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
              isStylingOpen
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Personnaliser les modèles, polices et espacements"
          >
            <Palette className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Mise en page</span>
          </button>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-1.5 tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.2, +(z + 0.1).toFixed(2)))}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Regenerate All with AI */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Voulez-vous que l’IA régénère l’intégralité de la lettre ?')) {
                regenerateCurrentLetter(cvData, language);
              }
            }}
            disabled={isGenerating}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            title="Régénérer tout le texte avec l'IA"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Régénérer par l'IA</span>
          </button>

          {/* Save button */}
          <button
            type="button"
            onClick={handleManualSave}
            disabled={isSaving}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{justSaved ? 'Enregistré !' : 'Enregistrer'}</span>
          </button>

          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>

          {/* PDF button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
            <span>{isExportingPdf ? 'Génération PDF...' : 'Télécharger PDF'}</span>
          </button>

          {/* Dark Mode toggle button right in editor */}
          <div className="border-l border-slate-200 dark:border-slate-800 pl-2">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* 2. Bibliothèque de modèles & Options de typographie et d'espacement */}
      {isStylingOpen && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-4 no-print transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Bibliothèque de modèles & Mise en page
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choisissez l’un des 3 modèles professionnels et ajustez les polices, interlignes et marges.
              </p>
            </div>

            {/* Quick color picker */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Accent :</span>
              <div className="flex items-center gap-1.5">
                {LETTER_ACCENT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => updateCurrentLetter({ accentColor: c.value })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                      activeAccentColor === c.value
                        ? 'border-white ring-2 ring-blue-500 shadow-xs'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  >
                    {activeAccentColor === c.value && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3 Layout Models Cards */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {LETTER_TEMPLATES.map((tmpl) => {
                const isSelected = activeTemplateId === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() =>
                      updateCurrentLetter({
                        templateId: tmpl.id,
                        fontFamily: tmpl.defaultFont,
                        spacing: tmpl.defaultSpacing,
                        margin: tmpl.defaultMargin,
                        accentColor: tmpl.defaultAccent,
                      })
                    }
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-600/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          {tmpl.name}
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                        {tmpl.tagline}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Police : {tmpl.defaultFont}</span>
                      <span>Marge : {tmpl.defaultMargin}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Typography & Spacings toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* 1. Police / Font */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Type className="w-3 h-3 text-slate-400" />
                <span>Police de caractères</span>
              </label>
              <select
                value={activeFont}
                onChange={(e) => updateCurrentLetter({ fontFamily: e.target.value as LetterFont })}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
              >
                {LETTER_FONTS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.sample})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Interligne / Line Spacing */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <AlignLeft className="w-3 h-3 text-slate-400" />
                <span>Espacement des lignes</span>
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {LETTER_SPACINGS.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => updateCurrentLetter({ spacing: sp.id })}
                    className={`py-1 text-[11px] font-semibold rounded transition-colors text-center ${
                      activeSpacing === sp.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Marges du document */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-slate-400" />
                <span>Marges de la page</span>
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {LETTER_MARGINS.map((mg) => (
                  <button
                    key={mg.id}
                    type="button"
                    onClick={() => updateCurrentLetter({ margin: mg.id })}
                    className={`py-1 text-[11px] font-semibold rounded transition-colors text-center ${
                      activeMargin === mg.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {mg.id === 'compact' ? 'Étroites' : mg.id === 'normal' ? 'Standard' : 'Larges'}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Taille de police */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Type className="w-3 h-3 text-slate-400" />
                <span>Taille du texte</span>
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {LETTER_FONT_SIZES.map((sz) => (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => updateCurrentLetter({ fontSize: sz.id })}
                    className={`py-1 text-[11px] font-semibold rounded transition-colors text-center ${
                      activeFontSize === sz.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {sz.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Sheet Viewport (Standard A4 Paper) */}
      <div className="flex items-start justify-center overflow-auto p-4 sm:p-8 bg-slate-200/80 dark:bg-slate-950/90 rounded-2xl border border-slate-300 dark:border-slate-800 transition-colors">
        <div
          className="transition-transform duration-200 origin-top shadow-xl print:shadow-none print:transform-none"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Authentic Printable A4 Letter Container */}
          <div
            id="printable-letter-sheet"
            className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-lg rounded-xs flex flex-col justify-between select-text relative box-border transition-all"
            style={{
              fontFamily: selectedFontDef.fontFamily,
              padding: selectedMarginDef.paddingMm,
              fontSize: selectedFontSizeDef.ptSize,
              lineHeight: selectedSpacingDef.lineHeight,
              ['--letter-padding' as any]: selectedMarginDef.paddingMm,
            }}
          >
            {/* RENDER ACCORDING TO TEMPLATE */}

            {/* TEMPLATE 1: MINIMALISTE */}
            {activeTemplateId === 'minimaliste' && (
              <div>
                {/* Minimalist Swiss header */}
                <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="text-xl font-extrabold tracking-tight text-slate-950">
                      {senderName}
                    </div>
                    {senderTitle && (
                      <div className="text-xs font-semibold text-slate-600">{senderTitle}</div>
                    )}
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 pt-0.5">
                      <span>{senderEmail}</span>
                      <span>·</span>
                      <span>{senderPhone}</span>
                      <span>·</span>
                      <span>{senderAddress}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1 text-xs text-slate-500">
                    <div className="mb-2 font-medium">{todayFormatted}</div>
                    <div className="font-extrabold text-slate-950 text-sm">{currentLetter.entreprise}</div>
                    {currentLetter.recipientName && (
                      <div className="font-medium text-slate-700">{currentLetter.recipientName}</div>
                    )}
                    <div>Recrutement & Talents</div>
                  </div>
                </div>

                {/* Minimalist Objet */}
                <div className="mb-6 pb-2 border-b-2 border-slate-900 flex items-baseline gap-2">
                  <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-900">
                    OBJET :
                  </span>
                  <span className="text-xs font-semibold text-slate-800">{subjectTitle}</span>
                </div>

                {/* Body Paragraphs */}
                <div
                  className="text-justify text-slate-800"
                  style={{
                    lineHeight: selectedSpacingDef.lineHeight,
                    fontSize: selectedFontSizeDef.ptSize,
                  }}
                >
                  {paragraphs.map((pText, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-lg transition-colors p-1 -m-1 hover:bg-slate-50"
                      style={{ marginBottom: selectedSpacingDef.paragraphGap }}
                    >
                      <textarea
                        rows={Math.max(2, Math.ceil(pText.length / 85))}
                        value={pText}
                        onChange={(e) => handleParagraphChange(idx, e.target.value)}
                        className="w-full bg-transparent resize-none border border-transparent focus:border-slate-300 rounded p-1 focus:bg-white focus:outline-hidden transition-all text-slate-800"
                        style={{
                          fontFamily: selectedFontDef.fontFamily,
                          lineHeight: selectedSpacingDef.lineHeight,
                          fontSize: selectedFontSizeDef.ptSize,
                        }}
                      />

                      {/* AI Spark button */}
                      <div className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white shadow-xs border border-slate-200 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => setRefiningParaIdx(refiningParaIdx === idx ? null : idx)}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded text-xs flex items-center gap-1 font-semibold"
                          title="Améliorer ce paragraphe avec l'IA"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span className="text-[10px]">IA</span>
                        </button>
                      </div>

                      {/* Inline Refinement */}
                      {refiningParaIdx === idx && (
                        <div className="no-print my-2 p-3 bg-white border border-slate-200 rounded-xl shadow-md space-y-2 text-left">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Améliorer ce paragraphe avec l'IA</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setRefiningParaIdx(null)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleRefineParagraphSubmit(idx, 'Rendre plus percutant avec des verbes d’action')}
                              disabled={isRefining}
                              className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
                            >
                              + Percutant
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRefineParagraphSubmit(idx, 'Rendre plus formel et élégant')}
                              disabled={isRefining}
                              className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
                            >
                              + Formel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRefineParagraphSubmit(idx, 'Synthétiser en 2 phrases')}
                              disabled={isRefining}
                              className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
                            >
                              + Plus court
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={refineInstruction}
                              onChange={(e) => setRefineInstruction(e.target.value)}
                              placeholder="Instruction spécifique pour l'IA..."
                              className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRefineParagraphSubmit(idx)}
                              disabled={isRefining}
                              className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Appliquer</span>}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TEMPLATE 2: MODERNE */}
            {activeTemplateId === 'moderne' && (
              <div>
                {/* Modern header with top accent bar */}
                <div
                  className="flex justify-between items-start mb-8 pb-5 border-b border-slate-100 pt-3"
                  style={{ borderTop: `4px solid ${activeAccentColor}` }}
                >
                  <div className="space-y-1 text-xs">
                    <div className="text-base font-extrabold text-slate-900">{senderName}</div>
                    {senderTitle && (
                      <div className="font-bold" style={{ color: activeAccentColor }}>
                        {senderTitle}
                      </div>
                    )}
                    <div className="text-slate-600">{senderEmail}</div>
                    <div className="text-slate-600">{senderPhone}</div>
                    <div className="text-slate-600">{senderAddress}</div>
                  </div>

                  <div className="text-right space-y-1 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/70 min-w-[200px]">
                    <div className="text-slate-500 mb-1 font-medium">
                      {senderAddress.split(',')[0] || 'Paris'}, le {todayFormatted}
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">{currentLetter.entreprise}</div>
                    <div className="text-slate-700 font-semibold">À l'attention du recrutement</div>
                    <div className="text-slate-500 text-[11px]">Ressources Humaines</div>
                  </div>
                </div>

                {/* Modern Objet callout banner */}
                <div
                  className="mb-6 p-3 rounded-r-xl border-l-4 font-bold text-xs sm:text-sm bg-slate-50/80"
                  style={{ borderLeftColor: activeAccentColor }}
                >
                  <span style={{ color: activeAccentColor }}>Objet : </span>
                  <span className="font-semibold text-slate-800">{subjectTitle}</span>
                </div>

                {/* Body Paragraphs */}
                <div
                  className="text-justify text-slate-800"
                  style={{
                    lineHeight: selectedSpacingDef.lineHeight,
                    fontSize: selectedFontSizeDef.ptSize,
                  }}
                >
                  {paragraphs.map((pText, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-lg transition-colors p-1 -m-1 hover:bg-blue-50/30"
                      style={{ marginBottom: selectedSpacingDef.paragraphGap }}
                    >
                      <textarea
                        rows={Math.max(2, Math.ceil(pText.length / 85))}
                        value={pText}
                        onChange={(e) => handleParagraphChange(idx, e.target.value)}
                        className="w-full bg-transparent resize-none border border-transparent focus:border-blue-400 rounded p-1 focus:bg-white focus:outline-hidden transition-all text-slate-800"
                        style={{
                          fontFamily: selectedFontDef.fontFamily,
                          lineHeight: selectedSpacingDef.lineHeight,
                          fontSize: selectedFontSizeDef.ptSize,
                        }}
                      />

                      {/* Paragraph floating AI spark button */}
                      <div className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white shadow-xs border border-slate-200 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => setRefiningParaIdx(refiningParaIdx === idx ? null : idx)}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded text-xs flex items-center gap-1 font-semibold"
                          title="Améliorer ce paragraphe avec l'IA"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span className="text-[10px]">IA</span>
                        </button>
                      </div>

                      {/* Inline paragraph refinement panel */}
                      {refiningParaIdx === idx && (
                        <div className="no-print my-2 p-3 bg-white border border-blue-200 rounded-xl shadow-md space-y-2 text-left">
                          <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Améliorer ce paragraphe avec l'IA</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setRefiningParaIdx(null)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleRefineParagraphSubmit(idx, 'Rendre plus percutant avec des verbes d’action')}
                              disabled={isRefining}
                              className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md"
                            >
                              + Percutant & Direct
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRefineParagraphSubmit(idx, 'Rendre plus formel, élégant et diplomate')}
                              disabled={isRefining}
                              className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md"
                            >
                              + Formel & Diplomate
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRefineParagraphSubmit(idx, 'Synthétiser en 2 phrases courtes')}
                              disabled={isRefining}
                              className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md"
                            >
                              + Plus court
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={refineInstruction}
                              onChange={(e) => setRefineInstruction(e.target.value)}
                              placeholder="Instruction libre (ex: insister sur la gestion d'équipe)..."
                              className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRefineParagraphSubmit(idx)}
                              disabled={isRefining}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Appliquer</span>}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TEMPLATE 3: CLASSIQUE */}
            {activeTemplateId === 'classique' && (
              <div>
                {/* Traditional French epistolary header */}
                <div className="flex justify-between items-start mb-8 text-xs">
                  {/* Sender on top left */}
                  <div className="space-y-1 text-slate-800">
                    <div className="text-base font-bold text-slate-900">{senderName}</div>
                    {senderTitle && <div className="italic text-slate-600">{senderTitle}</div>}
                    <div>{senderAddress}</div>
                    <div>Tél : {senderPhone}</div>
                    <div>Courriel : {senderEmail}</div>
                  </div>

                  {/* Recipient & date on top right */}
                  <div className="text-right space-y-1 text-slate-800 max-w-[260px]">
                    <div className="italic text-slate-600 mb-3">
                      {senderAddress.split(',')[0] || 'Paris'}, le {todayFormatted}
                    </div>
                    <div className="font-bold text-sm text-slate-900">{currentLetter.entreprise}</div>
                    {currentLetter.recipientName && (
                      <div className="font-semibold">{currentLetter.recipientName}</div>
                    )}
                    <div>Direction des Ressources Humaines</div>
                    <div className="text-slate-600">Service Recrutement</div>
                  </div>
                </div>

                {/* Classic Objet with underline */}
                <div className="mb-6 font-bold text-xs sm:text-sm text-slate-950">
                  <span>Objet : </span>
                  <span className="underline font-semibold">{subjectTitle}</span>
                </div>

                {/* Body Paragraphs */}
                <div
                  className="text-justify text-slate-900"
                  style={{
                    lineHeight: selectedSpacingDef.lineHeight,
                    fontSize: selectedFontSizeDef.ptSize,
                  }}
                >
                  {paragraphs.map((pText, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-lg transition-colors p-1 -m-1 hover:bg-stone-50"
                      style={{ marginBottom: selectedSpacingDef.paragraphGap }}
                    >
                      <textarea
                        rows={Math.max(2, Math.ceil(pText.length / 85))}
                        value={pText}
                        onChange={(e) => handleParagraphChange(idx, e.target.value)}
                        className="w-full bg-transparent resize-none border border-transparent focus:border-stone-400 rounded p-1 focus:bg-white focus:outline-hidden transition-all text-slate-900"
                        style={{
                          fontFamily: selectedFontDef.fontFamily,
                          lineHeight: selectedSpacingDef.lineHeight,
                          fontSize: selectedFontSizeDef.ptSize,
                        }}
                      />

                      {/* Paragraph AI button */}
                      <div className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white shadow-xs border border-stone-200 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => setRefiningParaIdx(refiningParaIdx === idx ? null : idx)}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded text-xs flex items-center gap-1 font-semibold"
                          title="Améliorer avec l'IA"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span className="text-[10px]">IA</span>
                        </button>
                      </div>

                      {/* Inline Refinement */}
                      {refiningParaIdx === idx && (
                        <div className="no-print my-2 p-3 bg-white border border-stone-300 rounded-xl shadow-md space-y-2 text-left">
                          <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Améliorer le paragraphe</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setRefiningParaIdx(null)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={refineInstruction}
                              onChange={(e) => setRefineInstruction(e.target.value)}
                              placeholder="Instructions..."
                              className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRefineParagraphSubmit(idx)}
                              disabled={isRefining}
                              className="px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-semibold"
                            >
                              {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Appliquer</span>}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signature Section at bottom right of letter */}
            <div className="mt-8 pt-4 flex flex-col items-end">
              <div className="text-right space-y-2 min-w-[200px]">
                <div className="font-bold text-slate-900 text-xs sm:text-sm">{senderName}</div>
                {senderTitle && (
                  <div className="text-[11px] text-slate-500">{senderTitle}</div>
                )}

                {/* Render Signature Image if present */}
                {activeSignature ? (
                  <div className="relative group inline-block">
                    <img
                      src={activeSignature}
                      alt="Signature manuscrite"
                      className="h-16 max-w-[180px] object-contain ml-auto filter drop-shadow-2xs"
                    />

                    {/* Change / remove action buttons on hover */}
                    <div className="no-print absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-slate-200 shadow-md rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setIsSignatureModalOpen(true)}
                        className="p-1 text-slate-600 hover:text-blue-600 rounded"
                        title="Changer la signature"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCurrentLetter({ signatureImageUrl: null })}
                        className="p-1 text-slate-600 hover:text-rose-600 rounded"
                        title="Retirer de cette lettre"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-print pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSignatureModalOpen(true)}
                      className="px-3 py-1.5 border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-all"
                    >
                      <PenTool className="w-3.5 h-3.5 text-blue-500" />
                      <span>Ajouter ma signature (photo / caméra)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 py-2">
        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Format standard A4 · Modèle {activeTemplateId} · Polices & espacements modifiables · Cliquez pour éditer</span>
      </div>

      {/* Signature Manager Modal */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <SignatureManager
              currentSignature={activeSignature}
              onSave={(newSignatureUrl) => {
                updateCurrentLetter({ signatureImageUrl: newSignatureUrl });
                setIsSignatureModalOpen(false);
              }}
              onRemove={() => {
                updateCurrentLetter({ signatureImageUrl: null });
                setIsSignatureModalOpen(false);
              }}
              onClose={() => setIsSignatureModalOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
