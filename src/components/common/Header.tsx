import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { useCV } from '../../context/CVContext';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { useLetter } from '../../context/LetterContext';
import {
  FileText,
  Download,
  Printer,
  Check,
  RotateCcw,
  Sparkles,
  User,
  LogIn,
  Save,
  Clock,
  CheckCircle2,
  FolderKanban,
  Edit2,
  Mail,
} from 'lucide-react';

export type AppView = 'home' | 'templates' | 'builder' | 'dashboard' | 'letters' | 'letter-editor';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onDownloadPdf?: () => void;
  onPrint?: () => void;
  isGeneratingPdf?: boolean;
  onOpenAccount?: () => void;
  onOpenCreateLetter?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onDownloadPdf,
  onPrint,
  isGeneratingPdf = false,
  onOpenAccount,
  onOpenCreateLetter,
}) => {
  const { t, language } = useTranslation();
  const { letters } = useLetter();
  const {
    isSaving,
    loadSample,
    resetCV,
    userCVs,
    currentCvTitle,
    setCurrentCvTitle,
    currentCvStatus,
    setCurrentCvStatus,
    manualSave,
    currentCvId,
  } = useCV();
  const { user, openAuthModal, token } = useAuth();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleReset = () => {
    if (window.confirm(t('app.resetConfirm', 'Voulez-vous vraiment effacer les données ?'))) {
      resetCV();
    }
  };

  const handleManualSave = async () => {
    const success = await manualSave();
    if (success) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  const toggleStatus = () => {
    const newStatus = currentCvStatus === 'draft' ? 'completed' : 'draft';
    setCurrentCvStatus(newStatus);
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[1650px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Brand & Current CV Title if in builder */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-left group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors hidden sm:inline">
              CV Builder
            </span>
          </button>

          {/* If in builder, display active CV title and status toggle */}
          {currentView === 'builder' && (
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3 min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={currentCvTitle}
                    onChange={(e) => setCurrentCvTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    autoFocus
                    className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-blue-500 focus:outline-hidden max-w-[180px] sm:max-w-[240px]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(false)}
                    className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[140px] sm:max-w-[220px]"
                  title="Cliquer pour renommer"
                >
                  <span className="truncate">{currentCvTitle || 'Mon CV'}</span>
                  <Edit2 className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              )}

              {/* Status pill toggle */}
              <button
                type="button"
                onClick={toggleStatus}
                className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-2xs ${
                  currentCvStatus === 'completed'
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-800'
                }`}
                title="Cliquer pour changer le statut"
              >
                {currentCvStatus === 'completed' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                    <span>{t('dashboard.completed', 'Terminé')}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                    <span>{t('dashboard.draft', 'Brouillon')}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap ${
              currentView === 'home'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-0.5'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('nav.home', 'Accueil')}
          </button>
          <button
            onClick={() => onNavigate('templates')}
            className={`transition-colors whitespace-nowrap ${
              currentView === 'templates'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-0.5'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('nav.templates', 'Modèles')}
          </button>
          <button
            onClick={() => onNavigate('builder')}
            className={`transition-colors whitespace-nowrap ${
              currentView === 'builder'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-0.5'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('nav.builder', 'Éditeur')}
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'dashboard'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-0.5'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>{t('nav.dashboard', 'Mes CV')}</span>
            {userCVs.length > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full">
                {userCVs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigate('letters')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'letters' || currentView === 'letter-editor'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-0.5'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Lettres IA</span>
            {letters.length > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full">
                {letters.length}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Actions & Language Switcher & Theme Toggle & User Account */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Builder specific quick save and state badge */}
          {currentView === 'builder' && (
            <>
              {/* Auto-save / Manual save badge */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSaving
                      ? 'bg-amber-400 animate-pulse'
                      : justSaved || !isSaving
                      ? 'bg-emerald-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
                <span className="truncate">
                  {isSaving
                    ? t('app.saving', 'Sauvegarde...')
                    : token && currentCvId
                    ? t('dashboard.savedInDb', 'Enregistré en ligne')
                    : t('app.saved', 'Sauvegardé')}
                </span>
              </div>

              {/* Manual Save Draft Button */}
              <button
                type="button"
                onClick={handleManualSave}
                disabled={isSaving}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
                title={t('dashboard.saveDraft', 'Enregistrer le brouillon')}
              >
                <Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden md:inline">
                  {justSaved ? 'Enregistré !' : t('dashboard.saveDraft', 'Enregistrer')}
                </span>
              </button>

              {/* Quick AI Letter Generation for current CV */}
              {onOpenCreateLetter && (
                <button
                  type="button"
                  onClick={onOpenCreateLetter}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-2xs transition-all whitespace-nowrap"
                  title="Rédiger une lettre de motivation ou demande d'emploi pour ce CV"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Lettre IA</span>
                </button>
              )}

              {/* Sample & Reset Buttons */}
              <div className="hidden 2xl:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => loadSample(language)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                  title={t('app.loadSample', 'Charger un exemple')}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('app.loadSample', 'Exemple')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title={t('app.reset', 'Réinitialiser')}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          {/* Quick AI Letter Generation from current CV if on builder */}
          {currentView === 'builder' && onOpenCreateLetter && (
            <button
              type="button"
              onClick={onOpenCreateLetter}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-2xs transition-colors"
              title="Générer une lettre de motivation pour ce CV avec l'IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Lettre IA</span>
            </button>
          )}

          {/* Print & Download buttons (active in Builder AND in Letter Editor) */}
          {(currentView === 'builder' || currentView === 'letter-editor') && (
            <>
              {onPrint && (
                <button
                  type="button"
                  onClick={onPrint}
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  title={t('app.print', 'Imprimer')}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('app.print', 'Imprimer')}</span>
                </button>
              )}

              {onDownloadPdf && (
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Download className={`w-3.5 h-3.5 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
                  <span className="hidden sm:inline">
                    {isGeneratingPdf
                      ? t('app.generatingPdf', 'Génération...')
                      : currentView === 'letter-editor'
                      ? 'Télécharger PDF'
                      : t('app.downloadPdf', 'PDF')}
                  </span>
                  <span className="sm:hidden">PDF</span>
                </button>
              )}
            </>
          )}

          {/* Quick "Mes CV" and "Lettres" buttons for mobile/tablet if not on builder/editor */}
          {currentView !== 'builder' && currentView !== 'letter-editor' && (
            <div className="lg:hidden flex items-center gap-1">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>CV</span>
              </button>
              <button
                onClick={() => onNavigate('letters')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                  currentView === 'letters'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Lettres</span>
              </button>
            </div>
          )}

          {/* Theme Toggle (Dark / Light Mode) */}
          <ThemeToggle />

          {/* Language Selector */}
          <LanguageSwitcher compact={false} />

          {/* User Account / Auth Buttons */}
          {user ? (
            <button
              type="button"
              onClick={onOpenAccount}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors shadow-2xs"
              title={t('auth.myAccount', 'Mon compte')}
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-xs font-semibold max-w-[100px] truncate">
                {user.name}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('auth.login', 'Connexion')}</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
              >
                <span>{t('auth.register', "S'inscrire")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
