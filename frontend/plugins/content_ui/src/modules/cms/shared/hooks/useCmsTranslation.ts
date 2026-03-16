import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { CMS_TRANSLATIONS } from '../../graphql/queries';

export interface TranslationData {
  title?: string;
  content?: string;
  excerpt?: string;
  customFieldsData?: any[];
}

interface UseCmsTranslationOptions {
  objectId?: string;
  type: 'post' | 'page' | 'menu' | 'webPage';
  availableLanguages: string[];
  defaultLanguage: string;
}

export const useCmsTranslation = ({
  objectId,
  type,
  availableLanguages,
  defaultLanguage,
}: UseCmsTranslationOptions) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [translations, setTranslations] = useState<
    Record<string, TranslationData>
  >({});
  const [defaultLangData, setDefaultLangData] =
    useState<TranslationData | null>(null);

  // Reset state when switching to a different object
  useEffect(() => {
    setTranslations({});
    setDefaultLangData(null);
    if (defaultLanguage) {
      setSelectedLanguage(defaultLanguage);
    } else {
      setSelectedLanguage('');
    }
  }, [objectId]);

  // Fetch existing translations
  const { data: translationsData } = useQuery(CMS_TRANSLATIONS, {
    variables: { objectId, type },
    skip: !objectId,
    fetchPolicy: 'network-only',
  });

  // Load fetched translations into state
  useEffect(() => {
    if (translationsData?.cmsTranslations) {
      const map: Record<string, TranslationData> = {};
      translationsData.cmsTranslations.forEach((t: any) => {
        map[t.language] = {
          title: t.title || '',
          content: t.content || '',
          excerpt: t.excerpt || '',
          customFieldsData: t.customFieldsData || [],
        };
      });
      setTranslations(map);
    }
  }, [translationsData]);

  // Auto-select default language
  useEffect(() => {
    if (!selectedLanguage && defaultLanguage) {
      setSelectedLanguage(defaultLanguage);
    }
  }, [defaultLanguage, selectedLanguage]);

  const isTranslationMode =
    !!selectedLanguage && selectedLanguage !== defaultLanguage;

  const languageOptions = useMemo(
    () =>
      availableLanguages.map((lang: string) => ({
        value: lang,
        label: lang.toUpperCase(),
        isDefault: lang === defaultLanguage,
        hasTranslation: !!translations[lang] && lang !== defaultLanguage,
      })),
    [availableLanguages, defaultLanguage, translations],
  );

  /**
   * Generic language switch handler.
   * @param lang - The language to switch to
   * @param getCurrentData - Returns current form values as TranslationData
   * @param setFormData - Sets form values from TranslationData
   * @param originalData - Original entity data (fallback for default language)
   */
  const handleLanguageChange = (
    lang: string,
    getCurrentData: () => TranslationData,
    setFormData: (data: TranslationData) => void,
    originalData?: TranslationData,
  ) => {
    if (lang === selectedLanguage) return;

    // Save current language data
    if (selectedLanguage === defaultLanguage) {
      setDefaultLangData(getCurrentData());
    } else {
      setTranslations((prev) => ({
        ...prev,
        [selectedLanguage]: getCurrentData(),
      }));
    }

    // Load target language data
    if (lang === defaultLanguage) {
      const data = defaultLangData || originalData || {};
      setFormData(data);
    } else {
      const translation = translations[lang];
      setFormData(translation || {});
    }

    setSelectedLanguage(lang);
  };

  return {
    selectedLanguage,
    setSelectedLanguage,
    translations,
    setTranslations,
    defaultLangData,
    setDefaultLangData,
    isTranslationMode,
    languageOptions,
    handleLanguageChange,
  };
};
