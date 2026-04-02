import { useState, useEffect, useMemo } from 'react';
import { UseFieldArrayReturn } from 'react-hook-form';
import { LANGUAGES } from '@/tms/constants/languages';
import { ElementCreateFormType } from '../constants/formSchema';

interface UseElementLanguageOptions {
  branchLanguages?: string[];
  mainLanguage?: string;
  fields: UseFieldArrayReturn<ElementCreateFormType, 'translations'>['fields'];
}

export const useElementLanguage = ({
  branchLanguages,
  mainLanguage,
  fields,
}: UseElementLanguageOptions) => {
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
  const translationIndex = fields.findIndex((f) => f.language === effectiveLang);
  const currencySymbol =
    LANGUAGES.find((l) => l.value === effectiveLang)?.symbol ?? '$';

  const labelSuffix = effectiveLang ? ` (${effectiveLang})` : '';

  const fieldPaths = {
    name: isMainLang
      ? 'name'
      : (`translations.${translationIndex}.name` as const),
    note: isMainLang
      ? 'note'
      : (`translations.${translationIndex}.note` as const),
    cost: isMainLang
      ? 'cost'
      : (`translations.${translationIndex}.cost` as const),
  } as { name: any; note: any; cost: any };

  return {
    allLanguages,
    translationLanguages,
    selectedLang: effectiveLang,
    setSelectedLang,
    isMainLang,
    labelSuffix,
    currencySymbol,
    fieldPaths,
  };
};
