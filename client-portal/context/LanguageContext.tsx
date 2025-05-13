import React, { createContext, useState, useEffect, useContext } from 'react';

type Language = string;
type Translations = Record<string, any>;

interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: any;
}) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    // Load language from localStorage on initial load
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Load language file when language changes
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/static/locales/${language}.json`);

        const data = await response.json();
        setTranslations(data);

        // Save language to localStorage
        localStorage.setItem('language', language);

        // Update HTML lang attribute for accessibility
        document.documentElement.lang = language;
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to empty translations
        setTranslations({});
      }
    };

    loadTranslations();
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations;

    for (const k of keys) {
      if (!result || !result[k]) return key; // Return the key if translation not found
      result = result[k];
    }

    return result as string;
  };

  return (
    <LanguageContext.Provider
      value={{ language, translations, setLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};
