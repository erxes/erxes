import { useState, useEffect, useMemo } from 'react';
import { UseFieldArrayReturn } from 'react-hook-form';
import { AmenityCreateFormType } from '../constants/formSchema';

interface UseAmenityLanguageOptions {
  branchLanguages?: string[];
  mainLanguage?: string;
  fields: UseFieldArrayReturn<AmenityCreateFormType, 'translations'>['fields'];
}

type FieldPaths = {
  name: 'name' | `translations.${number}.name`;
};

export const useAmenityLanguage = ({
  branchLanguages,
  mainLanguage,
  fields,
}: UseAmenityLanguageOptions) => {
  const allLanguages = useMemo(() => {
    const base =
      branchLanguages && branchLanguages.length > 0
        ? branchLanguages
        : mainLanguage
          ? [mainLanguage]
          : [];
    if (mainLanguage && !base.includes(mainLanguage)) {
      return [mainLanguage, ...base];
    }
    return base;
  }, [branchLanguages, mainLanguage]);

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
    } else if (
      selectedLang &&
      allLanguages.length > 0 &&
      !allLanguages.includes(selectedLang)
    ) {
      setSelectedLang(primaryLanguage);
    }
  }, [primaryLanguage, selectedLang, allLanguages]);

  const effectiveLang = selectedLang || primaryLanguage;
  const isMainLang = effectiveLang === primaryLanguage;
  const translationIndex = fields.findIndex(
    (f) => f.language === effectiveLang,
  );
  const labelSuffix = effectiveLang ? ` (${effectiveLang})` : '';

  const fieldPaths: FieldPaths = {
    name:
      isMainLang || translationIndex < 0
        ? 'name'
        : `translations.${translationIndex}.name`,
  };

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