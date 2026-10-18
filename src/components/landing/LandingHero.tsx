import React from 'react';
import { useTranslation } from '../../i18n';
import { useCV } from '../../context/CVContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Eye,
  Download,
  Save,
  Languages as LanguagesIcon,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Mail,
  PenTool,
} from 'lucide-react';

interface LandingHeroProps {
  onStartBuilder: () => void;
  onExploreTemplates: () => void;
  onOpenDashboard?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartBuilder,
  onExploreTemplates,
  onOpenDashboard,
}) => {
  const { t } = useTranslation();
  const { user, openAuthModal } = useAuth();

  const features = [
    {
      icon: Eye,
      title: t('hero.feature1Title', 'Aperçu instantané'),
      desc: t('hero.feature1Desc', 'Visualisez chaque modification en direct, au format standard A4.'),
    },
    {
      icon: Download,
      title: t('hero.feature2Title', 'Export PDF & Impression'),
      desc: t('hero.feature2Desc', 'Téléchargement direct en haute qualité ou impression propre prête pour les recruteurs.'),
    },
    {
      icon: Save,
      title: t('hero.feature3Title', 'Sauvegarde automatique'),
      desc: t('hero.feature3Desc', 'Vos informations restent enregistrées localement dans votre navigateur, sans perte.'),
    },
    {
      icon: LanguagesIcon,
      title: t('hero.feature4Title', '100% Multilingue'),
      desc: t('hero.feature4Desc', 'Interface disponible en français, anglais et espagnol pour faciliter votre création.'),
    },
    {
      icon: Mail,
      title: 'Lettres IA & Signature',
      desc: 'Lettres de motivation et demandes d’emploi générées sur mesure à partir de votre CV, avec capture de signature photo ou caméra.',
    },
  ];

  return (
    <div className="space-y-16 py-8 md:py-16">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        {/* Subtle trust badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{t('hero.badge', '100% Gratuit · Sans inscription')}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6">
          {t('hero.title', 'Créez un CV remarquable qui décroche des entretiens')}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          {t(
            'hero.subtitle',
            'Concevez un curriculum vitae moderne et professionnel en temps réel. Choisissez parmi des modèles soignés, remplissez vos informations et exportez en PDF haute définition.'
          )}
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStartBuilder}
            className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm group"
          >
            <span>{t('hero.cta', 'Commencer mon CV gratuitement')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onExploreTemplates}
            className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs transition-all text-sm"
          >
            {t('hero.exploreTemplates', 'Découvrir les 5 modèles')}
          </button>
        </div>

        {/* Account creation / login prompt */}
        {!user ? (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Vous souhaitez sauvegarder plusieurs CV ?</span>
            <button
              onClick={() => openAuthModal('register')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Créer un compte gratuit
            </button>
            <span>ou</span>
            <button
              onClick={() => openAuthModal('login')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              se connecter
            </button>
          </div>
        ) : (
          onOpenDashboard && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs">
              <span className="text-slate-600 dark:text-slate-400">Connecté en tant que {user.name} ·</span>
              <button
                onClick={onOpenDashboard}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold flex items-center gap-1"
              >
                <span>Accéder à mon tableau de bord "Mes CV"</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )
        )}

        {/* Quiet proof indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Aucun compte requis
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Export PDF haute fidélité
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Conforme filtres ATS
          </span>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-sm transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
