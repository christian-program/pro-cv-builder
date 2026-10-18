import React, { useState } from 'react';
import { useLetter } from '../../context/LetterContext';
import { useCV } from '../../context/CVContext';
import { useAuth } from '../../context/AuthContext';
import { LetterItem, LetterType } from '../../types/letter';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  Download,
  Trash2,
  Copy,
  ChevronRight,
  Building2,
  Calendar,
  PenTool,
  Loader2,
  LayoutGrid,
  Table as TableIcon,
  Palette,
  FileCheck,
} from 'lucide-react';
import { exportLetterToPdf } from '../../utils/pdfExport';

interface LetterListProps {
  onOpenLetterEditor: (letter: LetterItem) => void;
  onOpenCreateModal: () => void;
}

export const LetterList: React.FC<LetterListProps> = ({
  onOpenLetterEditor,
  onOpenCreateModal,
}) => {
  const {
    letters,
    deleteLetter,
    duplicateLetter,
    isLoadingLetters,
  } = useLetter();
  const { cvData } = useCV();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | LetterType>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filtered letters
  const filteredLetters = letters.filter((letter) => {
    const matchesSearch =
      letter.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (letter.notes && letter.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || letter.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Voulez-vous vraiment supprimer cette lettre ?')) {
      await deleteLetter(id);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await duplicateLetter(id);
  };

  const handleQuickDownload = async (e: React.MouseEvent, letter: LetterItem) => {
    e.stopPropagation();
    try {
      setDownloadingId(letter.id);
      await exportLetterToPdf({
        letter,
        cvData,
        userSignatureUrl: user?.signatureImageUrl,
      });
    } catch (err) {
      console.error('Failed to download PDF letter', err);
    } finally {
      setDownloadingId(null);
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
    <div className="space-y-6">
      {/* Top Header & Search Bar with View Mode & Dark Mode button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par entreprise, poste visé..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              typeFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Toutes ({letters.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('motivation')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              typeFilter === 'motivation'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Motivation
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('demande_emploi')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              typeFilter === 'demande_emploi'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Demande d’emploi
          </button>
        </div>

        {/* View Mode Switcher (Grid vs Table) + Dark Mode Button */}
        <div className="flex items-center gap-1.5 shrink-0 border-l border-slate-200 dark:border-slate-800 pl-2">
          {/* Table / Grid Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
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
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Affichage en tableau (Table View)"
              aria-label="Affichage en tableau"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Dark Mode button */}
          <ThemeToggle />

          {/* Action Button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rédiger</span>
          </button>
        </div>
      </div>

      {/* Content Rendering: Loading / Table / Cards */}
      {isLoadingLetters ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Chargement de vos lettres...</p>
        </div>
      ) : filteredLetters.length > 0 ? (
        viewMode === 'table' ? (
          /* TABLE VIEW WITH FULL DARK MODE */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Entreprise & Poste</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Modèle</th>
                    <th className="py-3.5 px-4">Signature</th>
                    <th className="py-3.5 px-4">Dernière modif.</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredLetters.map((letter) => {
                    const isMotivation = letter.type === 'motivation';
                    const hasSignature = !!letter.signatureImageUrl || !!user?.signatureImageUrl;
                    const tmpl = letter.templateId || 'moderne';

                    return (
                      <tr
                        key={letter.id}
                        onClick={() => onOpenLetterEditor(letter)}
                        className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-medium">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                {letter.entreprise}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {letter.poste}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isMotivation
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                                : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                            }`}
                          >
                            {isMotivation ? 'Motivation' : 'Demande'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="capitalize text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center gap-1">
                            <Palette className="w-3 h-3 text-slate-400" />
                            <span>{tmpl}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {hasSignature ? (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <PenTool className="w-3 h-3" />
                              <span>Signée</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Non signée</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                          {formatDate(letter.updatedAt)}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleQuickDownload(e, letter)}
                              disabled={downloadingId === letter.id}
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Télécharger PDF (A4)"
                            >
                              {downloadingId === letter.id ? (
                                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDuplicate(e, letter.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Dupliquer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(e, letter.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenLetterEditor(letter)}
                              className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold rounded-lg text-xs hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors ml-1"
                            >
                              Éditer
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
          /* CARD GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLetters.map((letter) => {
              const isMotivation = letter.type === 'motivation';
              const hasSignature = !!letter.signatureImageUrl || !!user?.signatureImageUrl;
              const tmpl = letter.templateId || 'moderne';

              return (
                <div
                  key={letter.id}
                  onClick={() => onOpenLetterEditor(letter)}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all p-5 flex flex-col justify-between cursor-pointer space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isMotivation
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                              : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                          }`}
                        >
                          {isMotivation ? 'Lettre de motivation' : 'Demande d’emploi'}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                          {tmpl}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(letter.updatedAt)}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {letter.poste}
                      </h3>
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{letter.entreprise}</span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {letter.contenu.replace(/^#+.*$/gm, '').trim()}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      {hasSignature ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <PenTool className="w-3 h-3" />
                          <span>Avec signature</span>
                        </span>
                      ) : (
                        <span>Non signée</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleQuickDownload(e, letter)}
                        disabled={downloadingId === letter.id}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Télécharger PDF (A4)"
                      >
                        {downloadingId === letter.id ? (
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(e, letter.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Dupliquer cette lettre"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, letter.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center gap-0.5 ml-1 group-hover:translate-x-0.5 transition-transform">
                        Éditer <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 bg-white dark:bg-slate-900">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {searchTerm || typeFilter !== 'all'
                ? 'Aucune lettre ne correspond à vos filtres'
                : 'Aucune lettre rédigée pour le moment'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Générez une lettre de motivation ou de candidature spontanée ciblée en quelques secondes grâce à l’IA.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs inline-flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Rédiger ma première lettre IA</span>
          </button>
        </div>
      )}
    </div>
  );
};
