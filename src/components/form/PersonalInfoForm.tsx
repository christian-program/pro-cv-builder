import React, { useRef } from 'react';
import { useCV } from '../../context/CVContext';
import { useTranslation } from '../../i18n';
import { SAMPLE_AVATARS } from '../../data/sampleCV';
import { User, Briefcase, Mail, Phone, MapPin, Globe, Linkedin, Github, Upload, Trash2, Image as ImageIcon } from 'lucide-react';

export const PersonalInfoForm: React.FC = () => {
  const { cvData, updatePersonal } = useCV();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { personal } = cvData;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('L’image est trop volumineuse (max 4 Mo)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updatePersonal('photoUrl', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          {t('form.personal.title', 'Informations personnelles')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t('form.personal.subtitle', 'Renseignez vos coordonnées de contact.')}
        </p>
      </div>

      {/* Photo Upload Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="relative w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-600 flex items-center justify-center">
          {personal.photoUrl ? (
            <img
              src={personal.photoUrl}
              alt="Avatar preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          )}
        </div>

        <div className="space-y-2 flex-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('form.personal.photo', 'Photo de profil')}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{t('form.personal.uploadPhoto', 'Importer une photo')}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                updatePersonal(
                  'photoUrl',
                  personal.photoUrl === SAMPLE_AVATARS.woman ? SAMPLE_AVATARS.man : SAMPLE_AVATARS.woman
                )
              }
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('form.personal.useSamplePhoto', 'Exemple')}</span>
            </button>

            {personal.photoUrl && (
              <button
                type="button"
                onClick={() => updatePersonal('photoUrl', '')}
                className="px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1"
                title={t('form.personal.removePhoto', 'Supprimer')}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('form.personal.removePhoto', 'Supprimer')}</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {t('form.personal.photoHint', 'Format JPG ou PNG recommandé. Poids max 3 Mo.')}
          </p>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('form.personal.fullName', 'Nom complet')}</span>
          </label>
          <input
            type="text"
            value={personal.fullName}
            onChange={(e) => updatePersonal('fullName', e.target.value)}
            placeholder={t('form.personal.fullNamePlaceholder', 'ex: Alexandre Dupont')}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Job Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('form.personal.jobTitle', 'Titre du poste')}</span>
          </label>
          <input
            type="text"
            value={personal.title}
            onChange={(e) => updatePersonal('title', e.target.value)}
            placeholder={t('form.personal.jobTitlePlaceholder', 'ex: Développeur Full Stack Senior')}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('form.personal.email', 'Adresse e-mail')}</span>
          </label>
          <input
            type="email"
            value={personal.email}
            onChange={(e) => updatePersonal('email', e.target.value)}
            placeholder={t('form.personal.emailPlaceholder', 'alexandre.dupont@email.com')}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('form.personal.phone', 'Téléphone')}</span>
          </label>
          <input
            type="tel"
            value={personal.phone}
            onChange={(e) => updatePersonal('phone', e.target.value)}
            placeholder={t('form.personal.phonePlaceholder', '+33 6 12 34 56 78')}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('form.personal.address', 'Ville, Pays')}</span>
          </label>
          <input
            type="text"
            value={personal.address}
            onChange={(e) => updatePersonal('address', e.target.value)}
            placeholder={t('form.personal.addressPlaceholder', 'Paris, France')}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('form.personal.website', 'Site web / Portfolio')}</span>
          </label>
          <input
            type="text"
            value={personal.website || ''}
            onChange={(e) => updatePersonal('website', e.target.value)}
            placeholder={t('form.personal.websitePlaceholder', 'https://alexandre-dupont.dev')}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Linkedin className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('form.personal.linkedin', 'LinkedIn')}</span>
          </label>
          <input
            type="text"
            value={personal.linkedin || ''}
            onChange={(e) => updatePersonal('linkedin', e.target.value)}
            placeholder={t('form.personal.linkedinPlaceholder', 'linkedin.com/in/alexandredupont')}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* GitHub / Other */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('form.personal.github', 'GitHub / Autre')}</span>
          </label>
          <input
            type="text"
            value={personal.github || ''}
            onChange={(e) => updatePersonal('github', e.target.value)}
            placeholder={t('form.personal.githubPlaceholder', 'github.com/alexdupont')}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>
    </div>
  );
};
