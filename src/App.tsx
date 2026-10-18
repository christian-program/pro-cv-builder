/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useTranslation } from './i18n';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CVProvider, useCV } from './context/CVContext';
import { LetterProvider, useLetter } from './context/LetterContext';
import { Header, AppView } from './components/common/Header';
import { LandingHero } from './components/landing/LandingHero';
import { TemplateGallery } from './components/templates/TemplateGallery';
import { BuilderView } from './components/builder/BuilderView';
import { CVDashboard } from './components/dashboard/CVDashboard';
import { LetterEditorView } from './components/letters/LetterEditorView';
import { LetterGenerationModal } from './components/letters/LetterGenerationModal';
import { AuthModal } from './components/auth/AuthModal';
import { AccountModal } from './components/auth/AccountModal';
import { LetterType, LetterItem } from './types/letter';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Global Letter Generation Modal state
  const [isGlobalLetterModalOpen, setIsGlobalLetterModalOpen] = useState(false);
  const [globalLetterCvId, setGlobalLetterCvId] = useState<string | undefined>(undefined);
  const [globalLetterType, setGlobalLetterType] = useState<LetterType>('motivation');

  const { cvData, currentCvId } = useCV();
  const { currentLetter, setCurrentLetter } = useLetter();
  const { t } = useTranslation();

  const handleDownloadPdf = async () => {
    // If on letter editor view, PDF download is handled inside LetterEditorView
    if (currentView === 'letter-editor') {
      const letterDownloadBtn = document.getElementById('letter-download-pdf-btn');
      if (letterDownloadBtn) {
        letterDownloadBtn.click();
        return;
      }
    }

    // If not in builder view, go to builder view first
    if (currentView !== 'builder') {
      setCurrentView('builder');
      setTimeout(() => {
        executePdfDownload();
      }, 500);
      return;
    }
    executePdfDownload();
  };

  const executePdfDownload = async () => {
    const element = document.getElementById('printable-cv-area');
    if (!element) return;

    try {
      setIsGeneratingPdf(true);
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
        : 'CV.pdf';

      pdf.save(fileName);
    } catch (err) {
      console.error('PDF export error', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenCreateLetter = (cvId?: string, type: LetterType = 'motivation') => {
    setGlobalLetterCvId(cvId || currentCvId || undefined);
    setGlobalLetterType(type);
    setIsGlobalLetterModalOpen(true);
  };

  const handleOpenLetterEditor = (letter: LetterItem) => {
    setCurrentLetter(letter);
    setCurrentView('letter-editor');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-200 transition-colors duration-150">
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onDownloadPdf={handleDownloadPdf}
        onPrint={handlePrint}
        isGeneratingPdf={isGeneratingPdf}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenCreateLetter={() => handleOpenCreateLetter()}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <div>
            <LandingHero
              onStartBuilder={() => setCurrentView('builder')}
              onExploreTemplates={() => setCurrentView('templates')}
              onOpenDashboard={() => setCurrentView('dashboard')}
            />
            <div className="max-w-6xl mx-auto px-4 pb-16">
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <TemplateGallery
                  onContinueToBuilder={() => setCurrentView('builder')}
                />
              </div>
            </div>
          </div>
        )}

        {currentView === 'templates' && (
          <div className="py-6">
            <TemplateGallery
              onContinueToBuilder={() => setCurrentView('builder')}
            />
          </div>
        )}

        {currentView === 'builder' && (
          <BuilderView
            onOpenTemplates={() => setCurrentView('templates')}
          />
        )}

        {currentView === 'dashboard' && (
          <CVDashboard
            onOpenBuilder={() => setCurrentView('builder')}
            onExploreTemplates={() => setCurrentView('templates')}
            onOpenLetterEditor={handleOpenLetterEditor}
            initialTab="cvs"
          />
        )}

        {currentView === 'letters' && (
          <CVDashboard
            onOpenBuilder={() => setCurrentView('builder')}
            onExploreTemplates={() => setCurrentView('templates')}
            onOpenLetterEditor={handleOpenLetterEditor}
            initialTab="letters"
          />
        )}

        {currentView === 'letter-editor' && (
          <LetterEditorView
            onBackToDashboard={() => setCurrentView('letters')}
          />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />

      {/* Global Letter Generation Modal */}
      <LetterGenerationModal
        isOpen={isGlobalLetterModalOpen}
        onClose={() => setIsGlobalLetterModalOpen(false)}
        onLetterGenerated={() => {
          setIsGlobalLetterModalOpen(false);
          setCurrentView('letter-editor');
        }}
        initialCvId={globalLetterCvId}
        initialType={globalLetterType}
      />

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">CV Builder</span>
            <span>·</span>
            <span>{t('app.tagline', 'Générateur de CV gratuit, multilingue et responsive')}</span>
          </div>

          <div className="flex items-center gap-1">
            <span>Conçu avec précision & typographie soignée</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CVProvider>
            <LetterProvider>
              <AppContent />
            </LetterProvider>
          </CVProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
