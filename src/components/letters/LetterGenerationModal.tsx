import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { useLetter } from '../../context/LetterContext';
import { useTranslation } from '../../i18n';
import { LetterType, LetterTone } from '../../types/letter';
import {
  FileText,
  Sparkles,
  X,
  Building2,
  Briefcase,
  Sliders,
  AlignLeft,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Send,
} from 'lucide-react';

interface LetterGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLetterGenerated: () => void;
  initialCvId?: string;
  initialType?: LetterType;
}

export const LetterGenerationModal: React.FC<LetterGenerationModalProps> = ({
  isOpen,
  onClose,
  onLetterGenerated,
  initialCvId,
  initialType = 'motivation',
}) => {
  const { userCVs, cvData, currentCvId, loadCV } = useCV();
  const { createLetterFromCV, isGenerating } = useLetter();
  const { language, t } = useTranslation();

  const [selectedCvId, setSelectedCvId] = useState<string>(
    initialCvId || currentCvId || (userCVs[0]?.id ?? '')
  );
  const [type, setType] = useState<LetterType>(initialType);
  const [entreprise, setEntreprise] = useState('');
  const [poste, setPoste] = useState(cvData.personal.title || '');
  const [tone, setTone] = useState<LetterTone>('formel');
  const [notes, setNotes] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (initialCvId) {
        setSelectedCvId(initialCvId);
        const cv = userCVs.find((c) => c.id === initialCvId);
        if (cv?.data?.personal?.title && !poste) {
          setPoste(cv.data.personal.title);
        }
      }
      if (initialType) {
        setType(initialType);
      }
      setError(null);
    }
  }, [isOpen, initialCvId, initialType, userCVs]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entreprise.trim() || !poste.trim()) {
      setError('Veuillez renseigner le nom de l’entreprise et le poste visé.');
      return;
    }

    setError(null);
    try {
      // Find selected CV data
      let baseCVData = cvData;
      if (selectedCvId && selectedCvId !== currentCvId) {
        const found = userCVs.find((c) => c.id === selectedCvId);
        if (found && found.data) {
          baseCVData = found.data;
        }
      }

      await createLetterFromCV(
        {
          cvId: selectedCvId || 'current',
          type,
          entreprise: entreprise.trim(),
          poste: poste.trim(),
          tone,
          notes: notes.trim(),
          recipientName: recipientName.trim(),
          recipientAddress: recipientAddress.trim(),
        },
        baseCVData,
        language
      );

      onClose();
      onLetterGenerated();
    } catch (err: any) {
      console.error('Error generating letter:', err);
      setError(err.message || 'Erreur lors de la génération de la lettre.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Rédiger une lettre personnalisée par l'IA
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Générez une candidature sur mesure adaptée à l'entreprise à partir de votre CV.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* 1. Document Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Type de lettre
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('motivation')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  type === 'motivation'
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 shadow-2xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Lettre de motivation</span>
                  {type === 'motivation' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-snug">
                  Réponse à une offre d'emploi ou annonce précise.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setType('demande_emploi')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  type === 'demande_emploi'
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 shadow-2xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>Demande d'emploi</span>
                  {type === 'demande_emploi' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-snug">
                  Candidature spontanée ou sollicitation directe.
                </p>
              </button>
            </div>
          </div>

          {/* 2. Base CV selection */}
          {userCVs.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>CV de référence à exploiter</span>
              </label>
              <select
                value={selectedCvId}
                onChange={(e) => setSelectedCvId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                {userCVs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} — {c.data?.personal?.title || c.data?.personal?.fullName || 'CV'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Company & Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Nom de l'entreprise *</span>
              </label>
              <input
                type="text"
                required
                value={entreprise}
                onChange={(e) => setEntreprise(e.target.value)}
                placeholder="ex: Google, Doctolib, Société Générale"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Poste visé *</span>
              </label>
              <input
                type="text"
                required
                value={poste}
                onChange={(e) => setPoste(e.target.value)}
                placeholder="ex: Développeur Full Stack Senior"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          {/* 4. Tone Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Ton souhaité</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'formel' as LetterTone, label: 'Formel & Courtois', desc: 'Classique & élégant' },
                { id: 'dynamique' as LetterTone, label: 'Dynamique & Moderne', desc: 'Startup & prise d’initiative' },
                { id: 'convaincant' as LetterTone, label: 'Impact & Chiffres', desc: 'Axé ROI & résultats' },
              ].map((tItem) => (
                <button
                  key={tItem.id}
                  type="button"
                  onClick={() => setTone(tItem.id)}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    tone === tItem.id
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500/20 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-bold leading-tight">{tItem.label}</div>
                  <div className="text-[9.5px] text-slate-400 mt-0.5">{tItem.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Optional Notes & Specific Context */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes complémentaires (optionnel)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Pourquoi cette entreprise spécifiquement, disponibilité immédiate, mobilité géographique..."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors leading-relaxed"
            />
          </div>

          {/* Modal Footer with Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 disabled:bg-blue-400"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rédaction IA en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Générer ma lettre avec l'IA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
