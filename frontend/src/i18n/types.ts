export type SupportedLanguageCode = 'en' | 'te' | 'hi' | 'ta' | 'kn' | 'ml' | 'mr' | 'bn' | 'pt';

export interface LanguageOption {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  speechLang: string;
  flag: string;
}

export type TranslationDictionary = Record<string, any>;
