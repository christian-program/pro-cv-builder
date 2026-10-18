import React, { useState } from 'react';
import { useCV, CVListItem } from '../../context/CVContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { TemplateId } from '../../types/cv';
import { CVRenderer } from '../templates/CVRenderer';
import {
  FileText,
  Plus,
  Search,
  Copy,
  Trash2,
  Edit3,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Printer,
  X,
  LogIn,
  UserPlus,
  Check,
  ChevronRight,
  Filter,
  Mail,
  Send,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLetter } from '../../context/LetterContext';
import { LetterList } from '../letters/LetterList';
import { LetterGenerationModal } from '../letters/LetterGenerationModal';
import { LetterItem, LetterType } from '../../types/letter';
import { ThemeToggle } from '../common/ThemeToggle';

interface CVDashboardProps {
  onOpenBuilder: () => void;
  onExploreTemplates: () => void;
  onOpenLetterEditor: (letter: LetterItem) => void;
  initialTab?: 'cvs' | 'letters';
}

export const CVDashboard: React.FC<CVDashboardProps> = ({
  onOpenBuilder,
  onExploreTemplates,
  onOpenLetterEditor,
  initialTab = 'cvs',
}) => {
  const {
    userCVs,
    isLoadingCVs,
    loadCV,
    createNewCV,
    duplicateUserCV,
    deleteUserCV,
    renameUserCV,
  } = useCV();
  const { user, openAuthModal } = useAuth();
  const { letters, currentLetter } = useLetter();
  const { t } = useTranslation();

  // Tab state: CVs vs Letters
  const [dashboardTab, setDashboardTab] = useState<'cvs' | 'letters'>(initialTab);

  // Letter generation modal state
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [letterModalCvId, setLetterModalCvId] = useState<string | undefined>(undefined);
  const [letterModalType, setLetterModalType] = useState<LetterType>('motivation');

  const handleOpenCreateLetterForCv = (cvId?: string, type: LetterType = 'motivation') => {
    setLetterModalCvId(cvId);
    setLetterModalType(type);
    setIsLetterModalOpen(true);
  };

  // Search & filter & view state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'completed'>('all');
  const [cvViewMode, setCvViewMode] = useState<'grid' | 'table'>('grid');

  // New CV Modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
  const [useBlankData, setUseBlankData] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Rename modal / inline state
  const [editingCvId, setEditingCvId] = useState<string | null>(null);
  const [editingCvTitle, setEditingCvTitle] = useState('');

  // Quick Preview Modal state
  const [previewingCv, setPreviewingCv] = useState<CVListItem | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Template options list
  const templates: { id: TemplateId; nameKey: string; color: string }[] = [
    { id: 'modern', nameKey: 'templates.modern.name', color: 'from-blue-600 to-indigo-700' },
    { id: 'classic', nameKey: 'templates.classic.name', color: 'from-slate-800 to-slate-900' },
    { id: 'creative', nameKey: 'templates.creative.name', color: 'from-violet-600 to-fuchsia-600' },
    { id: 'minimalist', nameKey: 'templates.minimalist.name', color: 'from-emerald-700 to-teal-800' },
    { id: 'executive', nameKey: 'templates.executive.name', color: 'from-amber-700 to-orange-800' },
  ];

  // Filtered CV list
  const filteredCVs = userCVs.filter((cv) => {
    const matchesSearch =
      cv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cv.data?.personal?.fullName &&
        cv.data.personal.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cv.data?.personal?.title &&
        cv.data.personal.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : cv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const draftsCount = userCVs.filter((c) => c.status === 'draft').length;
  const completedCount = userCVs.filter((c) => c.status === 'completed').length;

  // Handle open editor with CV
  const handleEdit = async (cv: CVListItem) => {
    await loadCV(cv.id);
    onOpenBuilder();
  };

  // Handle duplicate
  const handleDuplicate = async (cv: CVListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicateUserCV(cv.id);
  };

  // Handle delete
  const handleDelete = async (cv: CVListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('dashboard.confirmDelete', 'Voulez-vous vraiment supprimer ce CV ?'))) {
      await deleteUserCV(cv.id);
      if (previewingCv?.id === cv.id) {
        setPreviewingCv(null);
      }
    }
  };

  // Handle inline rename submit
  const handleRenameSubmit = async (cvId: string) => {
    if (editingCvTitle.trim()) {
      await renameUserCV(cvId, editingCvTitle.trim());
    }
    setEditingCvId(null);
  };

  // Handle creation of new CV
  const handleCreateNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const titleToUse = newTitle.trim() || t('dashboard.newCv', 'Nouveau CV');
      const newId = await createNewCV(titleToUse, selectedTemplate, useBlankData);
      setIsNewModalOpen(false);
      setNewTitle('');
      if (newId) {
        await loadCV(newId);
      }
      onOpenBuilder();
    } catch (err) {
      console.error('Error creating CV:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Quick PDF download inside preview modal
  const handleDownloadPreviewPdf = async () => {
    const element = document.getElementById('dashboard-cv-preview-modal-area');
    if (!element || !previewingCv) return;

    try {
      setIsDownloadingPdf(true);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      const fileName = `${previewingCv.title.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Guest Notice Banner if not logged in */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t('dashboard.guestNotice', 'Vous utilisez CV Builder en mode invité')}</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t(
                'dashboard.guestCta',
                'Créez un compte gratuit pour enregistrer plusieurs versions de CV, y accéder depuis n’importe où et synchroniser vos modifications en temps réel.'
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openAuthModal('login')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('auth.login', 'Connexion')}</span>
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('auth.register', 'Inscription gratuite')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {dashboardTab === 'cvs' ? t('dashboard.title', 'Mes CV') : 'Mes Lettres de motivation & Candidatures'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {dashboardTab === 'cvs'
              ? t(
                  'dashboard.subtitle',
                  'Gérez l’ensemble de vos curriculum vitae, reprenez vos brouillons et exportez à tout moment.'
                )
              : 'Générez des lettres personnalisées avec l’IA pour vos candidatures, signez-les et exportez-les en PDF.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleOpenCreateLetterForCv()}
            className="w-full sm:w-auto px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Rédiger une lettre IA</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!user) {
                openAuthModal('register');
              } else {
                setNewTitle('');
                setIsNewModalOpen(true);
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t('dashboard.newCv', 'Nouveau CV')}</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher: Mes CV vs Mes Lettres */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setDashboardTab('cvs')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            dashboardTab === 'cvs'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Curriculum Vitae</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              dashboardTab === 'cvs'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {userCVs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setDashboardTab('letters')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            dashboardTab === 'letters'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Lettres & Candidatures</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              dashboardTab === 'letters'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {letters.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {dashboardTab === 'cvs' ? (
        <>
          {/* Search & Filters Bar */}
      {userCVs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('dashboard.searchPlaceholder', 'Rechercher par titre ou poste...')}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('dashboard.filterAll', 'Tous')} ({userCVs.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                statusFilter === 'draft'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{t('dashboard.filterDrafts', 'Brouillons')}</span> ({draftsCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{t('dashboard.filterCompleted', 'Terminés')}</span> ({completedCount})
            </button>
          </div>

          {/* View Mode Switcher (Grid vs Table) + Dark Mode Button */}
          <div className="flex items-center gap-1.5 shrink-0 border-l border-slate-200 dark:border-slate-800 pl-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCvViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  cvViewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Affichage en cartes"
                aria-label="Affichage en cartes"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCvViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  cvViewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Affichage en tableau (Table View)"
                aria-label="Affichage en tableau"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Dark Mode table toggle button */}
            <ThemeToggle />
          </div>
        </div>
      )}

      {/* CV Grid */}
      {isLoadingCVs ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Chargement de vos CV...</p>
        </div>
      ) : filteredCVs.length > 0 ? (
        cvViewMode === 'table' ? (
          /* TABLE VIEW WITH FULL DARK MODE */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Titre du CV & Candidat</th>
                    <th className="py-3.5 px-4">Modèle</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4">Lettres IA</th>
                    <th className="py-3.5 px-4">Dernière modif.</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredCVs.map((cv) => {
                    const isCompleted = cv.status === 'completed';
                    const templateName = t(`templates.${cv.templateId || 'modern'}.name`, cv.templateId);
                    const fullName = cv.data?.personal?.fullName || 'Sans nom';
                    const jobTitle = cv.data?.personal?.title || 'Titre de poste non spécifié';
                    const accentColor = cv.config?.primaryColor || '#1e3a8a';
                    const cvLetters = letters.filter((l) => l.cvId === cv.id);

                    return (
                      <tr
                        key={cv.id}
                        onClick={() => handleEdit(cv)}
                        className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2.5 h-8 rounded-full shrink-0"
                              style={{ backgroundColor: accentColor }}
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                {cv.title}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {fullName} · {jobTitle}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="capitalize text-slate-700 dark:text-slate-300 font-semibold text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {templateName}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              isCompleted
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isCompleted ? 'bg-emerald-600' : 'bg-amber-500'
                              }`}
                            />
                            <span>{isCompleted ? t('dashboard.statusCompleted', 'Terminé') : t('dashboard.statusDraft', 'Brouillon')}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            {cvLetters.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => setDashboardTab('letters')}
                                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>{cvLetters.length} lettre{cvLetters.length > 1 ? 's' : ''}</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400">Aucune</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenCreateLetterForCv(cv.id)}
                              className="px-1.5 py-0.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-[10px] font-bold transition-colors"
                              title="Rédiger une lettre IA pour ce CV"
                            >
                              + Lettre
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                          {formatDate(cv.updatedAt)}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(cv)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title={t('dashboard.edit', 'Modifier')}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewingCv(cv)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title={t('dashboard.previewAndPrint', 'Aperçu & Export')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDuplicate(cv, e)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title={t('dashboard.duplicate', 'Dupliquer')}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(cv, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title={t('dashboard.delete', 'Supprimer')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(cv)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors ml-1"
                            >
                              Ouvrir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCVs.map((cv) => {
            const isCompleted = cv.status === 'completed';
            const templateName = t(`templates.${cv.templateId || 'modern'}.name`, cv.templateId);
            const fullName = cv.data?.personal?.fullName || 'Sans nom';
            const jobTitle = cv.data?.personal?.title || 'Titre de poste non spécifié';
            const accentColor = cv.config?.primaryColor || '#1e3a8a';

            return (
              <div
                key={cv.id}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col overflow-hidden"
              >
                {/* Visual Miniature Preview Card */}
                <div
                  onClick={() => handleEdit(cv)}
                  className="relative h-44 bg-slate-100/90 dark:bg-slate-950/80 cursor-pointer overflow-hidden border-b border-slate-100 dark:border-slate-800 flex items-center justify-center p-4 group-hover:bg-slate-100 dark:group-hover:bg-slate-950 transition-colors"
                >
                  {/* Subtle faux resume sheet */}
                  <div className="w-48 h-56 bg-white shadow-xs rounded-sm p-3 transform transition-transform group-hover:scale-105 duration-200 border border-slate-200/70 overflow-hidden flex flex-col text-[7px] leading-tight select-none">
                    {/* Header bar styled with CV accent color */}
                    <div
                      className="h-1.5 w-full rounded-xs mb-2"
                      style={{ backgroundColor: accentColor }}
                    />
                    <div className="font-bold text-slate-900 truncate">{fullName}</div>
                    <div className="text-[6px] text-slate-500 truncate mb-2">{jobTitle}</div>
                    <div className="w-full h-0.5 bg-slate-100 mb-2" />
                    <div className="space-y-1 opacity-70">
                      <div className="w-3/4 h-1 bg-slate-200 rounded-xs" />
                      <div className="w-full h-1 bg-slate-100 rounded-xs" />
                      <div className="w-2/3 h-1 bg-slate-100 rounded-xs" />
                    </div>
                    <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-[6px] text-slate-400">
                      <span className="capitalize">{templateName}</span>
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: accentColor }}
                      />
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                    <span className="text-xs font-semibold flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/30">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t('dashboard.edit', 'Modifier')}</span>
                    </span>
                  </div>

                  {/* Top Floating Status Pill */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs backdrop-blur-xs ${
                        isCompleted
                          ? 'bg-emerald-100/90 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100/90 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{t('dashboard.completed', 'Terminé')}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-2.5 h-2.5" />
                          <span>{t('dashboard.draft', 'Brouillon')}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Inline Title / Rename Field */}
                    {editingCvId === cv.id ? (
                      <div className="flex items-center gap-1 mb-1">
                        <input
                          type="text"
                          value={editingCvTitle}
                          onChange={(e) => setEditingCvTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(cv.id)}
                          autoFocus
                          className="w-full px-2 py-1 text-xs border border-blue-500 rounded-md focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameSubmit(cv.id)}
                          className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-md"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCvId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h3
                          onClick={() => handleEdit(cv)}
                          className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate cursor-pointer"
                          title={cv.title}
                        >
                          {cv.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCvId(cv.id);
                            setEditingCvTitle(cv.title);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title={t('dashboard.rename', 'Renommer')}
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {templateName}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(cv.updatedAt)}</span>
                      </span>
                    </div>

                    {/* Linked Letters indicator & quick letter generation */}
                    {(() => {
                      const cvLetters = letters.filter((l) => l.cvId === cv.id);
                      return (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-blue-500" />
                            <span>
                              {cvLetters.length} lettre{cvLetters.length > 1 ? 's' : ''} liée{cvLetters.length > 1 ? 's' : ''}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCreateLetterForCv(cv.id);
                            }}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                            title="Rédiger une lettre de motivation ou demande d'emploi rattachée à ce CV"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>+ Lettre IA</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEdit(cv)}
                      className="flex-1 py-1.5 px-3 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t('dashboard.edit', 'Modifier')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewingCv(cv)}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title={t('dashboard.previewAndPrint', 'Aperçu & Export')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDuplicate(cv, e)}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title={t('dashboard.duplicate', 'Dupliquer')}
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(cv, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title={t('dashboard.delete', 'Supprimer')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs max-w-2xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
            <FileText className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {searchTerm || statusFilter !== 'all'
                ? 'Aucun résultat trouvé'
                : t('dashboard.noCvsTitle', 'Aucun CV enregistré')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres ou termes de recherche.'
                : t(
                    'dashboard.noCvsDesc',
                    'Vous n’avez pas encore créé de CV avec votre compte. Commencez dès maintenant !'
                  )}
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  openAuthModal('register');
                } else {
                  setNewTitle('');
                  setIsNewModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('dashboard.startFirstCv', 'Créer mon premier CV')}</span>
            </button>
          </div>
        </div>
      )}
        </>
      ) : (
        <LetterList
          onOpenLetterEditor={onOpenLetterEditor}
          onOpenCreateModal={() => handleOpenCreateLetterForCv()}
        />
      )}

      {/* MODAL: Créer un nouveau CV */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{t('dashboard.newCvModalTitle', 'Créer un nouveau CV')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateNewSubmit} className="p-6 space-y-6">
              {/* Title input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Titre du CV <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ex: CV Développeur Full Stack Senior"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              {/* Template Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('dashboard.chooseTemplateDesc', 'Choisir un modèle de départ')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {templates.map((tmpl) => {
                    const isSelected = selectedTemplate === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tmpl.id)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/60 ring-2 ring-blue-600/20 shadow-2xs'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-full h-12 rounded-lg bg-gradient-to-br ${tmpl.color} mb-2 shadow-2xs`}
                        />
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {t(tmpl.nameKey, tmpl.id)}
                        </div>
                        {isSelected && (
                          <div className="mt-1 text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Choisi</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data starter choice */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Contenu initial</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-colors ${
                      !useBlankData
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/50'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="starterChoice"
                      checked={!useBlankData}
                      onChange={() => setUseBlankData(false)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Exemple complet (Recommandé)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Pré-rempli avec des sections riches faciles à adapter.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-colors ${
                      useBlankData
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/50'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="starterChoice"
                      checked={useBlankData}
                      onChange={() => setUseBlankData(true)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Page vierge</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Formulaire vide pour partir de zéro.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  {isCreating ? (
                    <span>Création en cours...</span>
                  ) : (
                    <>
                      <span>{t('dashboard.createAndEdit', 'Créer et ouvrir')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Quick Preview & Instant Export */}
      {previewingCv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden my-auto max-h-[92vh] flex flex-col transition-colors">
            {/* Top Toolbar */}
            <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{previewingCv.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Modèle : <span className="font-semibold capitalize">{previewingCv.templateId}</span> ·
                  Statut : {previewingCv.status === 'completed' ? 'Terminé' : 'Brouillon'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewingCv(null);
                    handleEdit(previewingCv);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPreviewPdf}
                  disabled={isDownloadingPdf}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Download className={`w-3.5 h-3.5 ${isDownloadingPdf ? 'animate-bounce' : ''}`} />
                  <span>{isDownloadingPdf ? 'Génération...' : 'Télécharger PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewingCv(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Preview Area */}
            <div className="p-4 sm:p-6 overflow-y-auto flex items-center justify-center bg-slate-200/60 dark:bg-slate-950/90">
              <div
                id="dashboard-cv-preview-modal-area"
                className="bg-white shadow-xl rounded-sm w-[794px] min-h-[1123px] overflow-hidden"
              >
                <CVRenderer
                  data={previewingCv.data}
                  config={previewingCv.config || { templateId: previewingCv.templateId }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Letter Generation Modal */}
      <LetterGenerationModal
        isOpen={isLetterModalOpen}
        onClose={() => setIsLetterModalOpen(false)}
        onLetterGenerated={() => {
          setIsLetterModalOpen(false);
          if (currentLetter) {
            onOpenLetterEditor(currentLetter);
          } else {
            setDashboardTab('letters');
          }
        }}
        initialCvId={letterModalCvId}
        initialType={letterModalType}
      />
    </div>
  );
};
