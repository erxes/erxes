import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { CMS_TRANSLATIONS } from '../../graphql/queries';

interface CmsTranslationRecord {
  language: string;
  title?: string;
  content?: string;
  excerpt?: string;
  customFieldsData?: unknown[];
}

export interface TranslationData {
  title?: string;
  content?: string;
  excerpt?: string;
  customFieldsData?: unknown[];
}

const hasNonEmptyValue = (data: TranslationData | undefined): boolean => {
  if (!data) return false;
  if (data.title && data.title.trim() !== '') return true;
  if (data.content && data.content.trim() !== '') return true;
  if (data.excerpt && data.excerpt.trim() !== '') return true;
  if (data.customFieldsData && data.customFieldsData.length > 0) return true;
  return false;
};

interface UseCmsTranslationOptions {
  objectId?: string;
  type: 'post' | 'page' | 'menu' | 'webPage';
  availableLanguages: string[];
  defaultLanguage: string;
  /** Extra dependency for the reset effect. Change this value to force a state
   *  reset even when objectId stays undefined (e.g. consecutive create sessions). */
  resetKey?: string | number | boolean;
}

export const useCmsTranslation = ({
  objectId,
  type,
  availableLanguages,
  defaultLanguage,
  resetKey,
}: UseCmsTranslationOptions) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [translations, setTranslations] = useState<
    Record<string, TranslationData>
  >({});
  const [defaultLangData, setDefaultLangData] =
    useState<TranslationData | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Ref to the caller's setFormData so the hydration effect can push
  // late-arriving data into the form.
  const setFormDataRef = useRef<((data: TranslationData) => void) | null>(
    null,
  );

  // Reset state when switching to a different object or starting a new session
  useEffect(() => {
    setTranslations({});
    setDefaultLangData(null);
    setIsHydrated(false);
    setFormDataRef.current = null;
    if (defaultLanguage) {
      setSelectedLanguage(defaultLanguage);
    } else {
      setSelectedLanguage('');
    }
  }, [objectId, resetKey]);

  // Fetch existing translations
  const { data: translationsData } = useQuery(CMS_TRANSLATIONS, {
    variables: { objectId, type },
    skip: !objectId,
    fetchPolicy: 'network-only',
  });

  // Load fetched translations into state, and push to form if the user
  // already switched to a non-default language before the query returned.
  useEffect(() => {
    if (!translationsData?.cmsTranslations) return;

    const map: Record<string, TranslationData> = {};
    translationsData.cmsTranslations.forEach((t: CmsTranslationRecord) => {
      map[t.language] = {
        title: t.title || '',
        content: t.content || '',
        excerpt: t.excerpt || '',
        customFieldsData: t.customFieldsData || [],
      };
    });
    setTranslations(map);
    setIsHydrated(true);

    // If the user switched language before the query returned, the form is
    // showing empty data.  Push the fetched translation into the form now.
    if (
      selectedLanguage &&
      selectedLanguage !== defaultLanguage &&
      map[selectedLanguage] &&
      setFormDataRef.current
    ) {
      setFormDataRef.current(map[selectedLanguage]);
    }
  }, [translationsData]);

  // Auto-select default language
  useEffect(() => {
    if (!selectedLanguage && defaultLanguage) {
      setSelectedLanguage(defaultLanguage);
    }
  }, [defaultLanguage, selectedLanguage]);

  const isTranslationMode =
    Boolean(selectedLanguage) && selectedLanguage !== defaultLanguage;

  const languageOptions = useMemo(
    () =>
      availableLanguages.map((lang: string) => ({
        value: lang,
        label: lang.toUpperCase(),
        isDefault: lang === defaultLanguage,
        hasTranslation: lang !== defaultLanguage && hasNonEmptyValue(translations[lang]),
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

    // Store the setter so the hydration effect can push late-arriving data
    setFormDataRef.current = setFormData;

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
    isHydrated,
    languageOptions,
    handleLanguageChange,
  };
};
