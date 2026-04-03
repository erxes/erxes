import { useState, useEffect, useMemo } from 'react';
import { UseFieldArrayReturn } from 'react-hook-form';
import { AmenityCreateFormType } from '../constants/formSchema';

interface UseAmenityLanguageOptions {
  branchLanguages?: string[];
  mainLanguage?: string;
  fields: UseFieldArrayReturn<AmenityCreateFormType, 'translations'>['fields'];
}

export const useAmenityLanguage = ({
  branchLanguages,
  mainLanguage,
  fields,
}: UseAmenityLanguageOptions) => {
  const allLanguages = useMemo(
    () =>
      branchLanguages && branchLanguages.length > 0
        ? branchLanguages
        : mainLanguage
          ? [mainLanguage]
          : [],
    [branchLanguages, mainLanguage],
  );

  const primaryLanguage = useMemo(
    () => mainLanguage ?? allLanguages[0] ?? '',
    [mainLanguage, allLanguages],
  );

  const translationLanguages = useMemo(
    () => allLanguages.filter((l) => l !== primaryLanguage),
    [allLanguages, primaryLanguage],
  );

  const [selectedLang, setSelectedLang] = useState(primaryLanguage);

  useEffect(() => {
    if (primaryLanguage && !selectedLang) {
      setSelectedLang(primaryLanguage);
    }
  }, [primaryLanguage, selectedLang]);

  const effectiveLang = selectedLang || primaryLanguage;
  const isMainLang = effectiveLang === primaryLanguage;
  const translationIndex = fields.findIndex(
    (f) => f.language === effectiveLang,
  );
  const labelSuffix = effectiveLang ? ` (${effectiveLang})` : '';

  const namePath =
    isMainLang || translationIndex < 0
      ? 'name'
      : (`translations.${translationIndex}.name` as const);

  const fieldPaths = {
    name: namePath,
  } as { name: any };

  return {
    allLanguages,
    translationLanguages,
    selectedLang: effectiveLang,
    setSelectedLang,
    isMainLang,
    labelSuffix,
    fieldPaths,
  };
};
