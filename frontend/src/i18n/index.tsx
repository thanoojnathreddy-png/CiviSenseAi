import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { SupportedLanguageCode, LanguageOption, TranslationDictionary } from './types';

export type { SupportedLanguageCode, LanguageOption, TranslationDictionary };

import en from './locales/en.json';
import te from './locales/te.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import mr from './locales/mr.json';
import bn from './locales/bn.json';
import pt from './locales/pt.json';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechLang: 'en-US', flag: '🇬🇧' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechLang: 'te-IN', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechLang: 'hi-IN', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechLang: 'ta-IN', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechLang: 'kn-IN', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechLang: 'ml-IN', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechLang: 'mr-IN', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechLang: 'bn-IN', flag: '🇮🇳' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', speechLang: 'pt-BR', flag: '🇧🇷' }
];

const DICTIONARIES: Record<SupportedLanguageCode, TranslationDictionary> = {
  en,
  te,
  hi,
  ta,
  kn,
  ml,
  mr,
  bn,
  pt
};

export const STORAGE_KEY = 'civisense_ui_language';

interface I18nContextType {
  language: SupportedLanguageCode;
  setLanguage: (lang: SupportedLanguageCode) => void;
  currentLanguage: LanguageOption;
  supportedLanguages: LanguageOption[];
  t: (key: string, fallbackOrParams?: string | Record<string, string | number>, defaultVal?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function resolvePath(obj: any, path: string): string | undefined {
  if (!obj) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{{${key}}}`;
  });
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved as SupportedLanguageCode;
      }
    }
    // Default fallback is strictly English
    return 'en';
  });

  const setLanguage = useCallback((newLang: SupportedLanguageCode) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) {
      setLanguageState(newLang);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newLang);
      }
    }
  }, []);

  const currentLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const t = useCallback(
    (key: string, fallbackOrParams?: string | Record<string, string | number>, defaultVal?: string): string => {
      let params: Record<string, string | number> | undefined;
      let fallback = defaultVal;

      if (typeof fallbackOrParams === 'string') {
        fallback = fallbackOrParams;
      } else if (fallbackOrParams && typeof fallbackOrParams === 'object') {
        params = fallbackOrParams;
      }

      // 1. Try selected language
      const targetDict = DICTIONARIES[language];
      let val = resolvePath(targetDict, key);

      // 2. Fall back to English if missing
      if (!val && language !== 'en') {
        val = resolvePath(DICTIONARIES['en'], key);
      }

      // 3. Fall back to default value or raw key
      if (!val) {
        val = fallback || key;
      }

      // 4. Interpolate parameters
      return interpolate(val, params);
    },
    [language]
  );

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

// Helper utilities for cross-mapping
export function getLanguageNameFromCode(code: string): string {
  const match = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return match ? match.name : 'English';
}

export function getCodeFromLanguageName(name: string): SupportedLanguageCode {
  const match = SUPPORTED_LANGUAGES.find(
    (l) => l.name.toLowerCase() === name.toLowerCase() || l.code.toLowerCase() === name.toLowerCase()
  );
  return match ? match.code : 'en';
}
