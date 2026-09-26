export type SupportedLanguageCode =
  | 'en'
  | 'hi'
  | 'te'
  | 'ta'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'bn'
  | 'gu'
  | 'pa'
  | 'or';

export interface LanguageOption {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  speechLang: string;
  flag: string;
}

export type TranslationDictionary = Record<string, any>;
