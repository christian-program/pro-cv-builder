import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  X,
  Check,
  Copy,
  RotateCw,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface AISuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (text: string, mode: 'replace' | 'append') => void;
  field: 'summary' | 'experience' | 'project';
  currentText: string;
  context?: {
    jobTitle?: string;
    company?: string;
    skills?: string[];
    degree?: string;
    institution?: string;
    projectTitle?: string;
  };
}

export const AISuggestionModal: React.FC<AISuggestionModalProps> = ({
  isOpen,
  onClose,
  onApply,
  field,
  currentText,
  context,
}) => {
  const { language } = useTranslation();
  const { token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          field,
          currentText,
          context,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok && data.error) {
        setError(data.error);
        setSuggestions([]);
      } else if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        setError('Aucune suggestion disponible. Réessayez dans un instant.');
      }
      if (token) refreshUser();
    } catch (e: any) {
      console.error('Failed to get AI suggestions', e);
      setError('Impossible de joindre le service d’IA.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const getVariantLabel = (index: number) => {
    if (index === 0) return 'Variante 1 · Impact & Résultats chiffrés';
    if (index === 1) return 'Variante 2 · Synthétique & Percutante';
    return 'Variante 3 · Expertise & Méthodologie';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Assistance IA à la rédaction
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentText
                  ? 'Reformulation améliorée et impactante'
                  : 'Suggestions personnalisées basées sur votre profil'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Context pill info */}
          {context && (context.jobTitle || context.company) && (
            <div className="px-3 py-2 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-xl text-xs text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <span className="font-semibold text-blue-800 dark:text-blue-200">Contexte pris en compte :</span>
              <span className="truncate">
                {context.jobTitle && `${context.jobTitle}`}
                {context.company && ` @ ${context.company}`}
              </span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Génération des suggestions en cours...
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Optimisation du style et des verbes d’action pour les recruteurs
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {!loading && error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={fetchSuggestions}
                  className="mt-2 text-xs font-bold text-rose-700 dark:text-rose-300 underline hover:text-rose-900 dark:hover:text-rose-100"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {/* Suggestions List */}
          {!loading && suggestions.length > 0 && (
            <div className="space-y-3">
              {suggestions.map((text, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50/40 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all flex flex-col justify-between gap-3 text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                        {getVariantLabel(idx)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(text, idx)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded transition-colors flex items-center gap-1 text-[11px]"
                        title="Copier dans le presse-papier"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">Copié</span>
                          </>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                      {text}
                    </p>
                  </div>

                  {/* Actions on this variant */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                    {currentText && (
                      <button
                        type="button"
                        onClick={() => {
                          onApply(text, 'append');
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      >
                        Ajouter à la suite
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onApply(text, 'replace');
                        onClose();
                      }}
                      className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <span>{currentText ? 'Remplacer le texte' : 'Insérer ce texte'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between">
          <button
            type="button"
            onClick={fetchSuggestions}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Régénérer d'autres variantes</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
