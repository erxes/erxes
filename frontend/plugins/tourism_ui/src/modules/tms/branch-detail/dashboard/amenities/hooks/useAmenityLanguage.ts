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

  const translationLanguages = useMemo(
    () => allLanguages.filter((l) => l !== mainLanguage),
    [allLanguages, mainLanguage],
  );

  const [selectedLang, setSelectedLang] = useState(
    mainLanguage || allLanguages[0] || '',
  );

  useEffect(() => {
    if (mainLanguage && !selectedLang) {
      setSelectedLang(mainLanguage);
    }
  }, [mainLanguage, selectedLang]);

  const effectiveLang = selectedLang || mainLanguage || allLanguages[0] || '';
  const isMainLang = !mainLanguage || effectiveLang === mainLanguage;
  const translationIndex = fields.findIndex(
    (f) => f.language === effectiveLang,
  );
  const labelSuffix = effectiveLang ? ` (${effectiveLang})` : '';

  const namePath = isMainLang
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
