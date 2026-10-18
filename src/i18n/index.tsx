import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import fr from './fr.json';
import en from './en.json';
import es from './es.json';
import { LanguageCode } from '../types/cv';

const dictionaries: Record<LanguageCode, any> = {
  fr,
  en,
  es,
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (path: string, fallback?: string) => string;
  getRaw: (path: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'cv_builder_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'fr' || saved === 'en' || saved === 'es') {
        return saved;
      }
      // Infer from browser language
      const navLang = navigator.language?.toLowerCase() || '';
      if (navLang.startsWith('fr')) return 'fr';
      if (navLang.startsWith('es')) return 'es';
      return 'en';
    } catch {
      return 'fr';
    }
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch {
      // storage unavailable
    }
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const getRaw = (path: string): any => {
    const keys = path.split('.');
    let curr = dictionaries[language];
    for (const key of keys) {
      if (curr && typeof curr === 'object' && key in curr) {
        curr = curr[key];
      } else {
        // Fallback to french or english if key missing
        let fallbackCurr = dictionaries.fr;
        for (const fKey of keys) {
          if (fallbackCurr && typeof fallbackCurr === 'object' && fKey in fallbackCurr) {
            fallbackCurr = fallbackCurr[fKey];
          } else {
            return undefined;
          }
        }
        return fallbackCurr;
      }
    }
    return curr;
  };

  const t = (path: string, fallback = ''): string => {
    const value = getRaw(path);
    if (typeof value === 'string') return value;
    return fallback || path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getRaw }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
