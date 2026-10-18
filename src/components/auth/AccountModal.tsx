import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCV } from '../../context/CVContext';
import { useTranslation } from '../../i18n';
import { SignatureManager } from '../signature/SignatureManager';
import {
  X,
  User,
  Mail,
  Calendar,
  Sparkles,
  LogOut,
  Trash2,
  FileText,
  AlertTriangle,
  Loader2,
  PenTool,
  Check,
  Camera,
  Upload,
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, deleteAccount, updateSignature } = useAuth();
  const { userCVs } = useCV();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureSuccessMsg, setSignatureSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const creationDate = new Date(user.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const aiUsed = user.aiSuggestionsUsedToday || 0;
  const aiMax = 50;
  const aiPercent = Math.min(100, Math.round((aiUsed / aiMax) * 100));

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Impossible de supprimer le compte.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleRemoveSignature = async () => {
    try {
      await updateSignature(null);
      setSignatureSuccessMsg('Signature supprimée avec succès.');
      setTimeout(() => setSignatureSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la signature.');
    }
  };

  const handleSignatureSaved = (sigUrl: string) => {
    setSignatureSuccessMsg('Signature enregistrée sur votre compte ! Elle sera automatiquement réutilisée pour vos lettres.');
    setIsSignatureModalOpen(false);
    setTimeout(() => setSignatureSuccessMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Mon Profil & Compte</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {signatureSuccessMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{signatureSuccessMsg}</span>
            </div>
          )}

          {/* User Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          {/* Signature Management Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  Signature officielle (Lettres)
                </span>
              </div>
              {user.signatureImageUrl && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  <Check className="w-2.5 h-2.5" />
                  <span>Enregistrée</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Votre signature manuscrite est enregistrée sur votre profil et réutilisée automatiquement pour toutes vos lettres de motivation et demandes d’emploi.
            </p>

            {user.signatureImageUrl ? (
              <div className="space-y-3">
                {/* Checkerboard transparency container */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[size:12px_12px] bg-[position:0_0,0_6px,6px_-6px,-6px_0] dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] flex items-center justify-center min-h-[70px]">
                  <img
                    src={user.signatureImageUrl}
                    alt="Signature enregistrée"
                    className="max-h-16 max-w-full object-contain filter drop-shadow-xs"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSignatureModalOpen(true)}
                    className="py-1.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <PenTool className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>Modifier la signature</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveSignature}
                    className="py-1.5 px-2.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-3 px-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-white/50 dark:bg-slate-800/40 space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Aucune signature enregistrée pour le moment.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Importer ou photographier ma signature</span>
                </button>
              </div>
            )}
          </div>

          {/* Stats & Quotas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Membre depuis le :</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{creationDate}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>CV enregistrés :</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{userCVs.length} CV</span>
            </div>

            {/* AI quota progress */}
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Suggestions IA utilisées aujourd'hui</span>
                </span>
                <span className="tabular-nums">
                  {aiUsed} / {aiMax}
                </span>
              </div>
              <div className="w-full bg-blue-100 dark:bg-blue-900/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${aiPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80">
                Le quota est réinitialisé automatiquement chaque jour à minuit.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Se déconnecter</span>
            </button>

            {/* Danger Zone */}
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer définitivement mon compte</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-2 text-center animate-in fade-in">
                <p className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Confirmer la suppression ?</span>
                </p>
                <p className="text-[11px] text-rose-700 dark:text-rose-300">
                  Cette action effacera l’ensemble de vos CV, vos lettres et votre compte de façon irréversible.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Suppression...</span>
                      </>
                    ) : (
                      <span>Oui, supprimer tout</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signature Manager Modal Sub-window */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <SignatureManager
              currentSignature={user.signatureImageUrl}
              onSave={handleSignatureSaved}
              onRemove={handleRemoveSignature}
              onClose={() => setIsSignatureModalOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
