import { useState, useEffect, useMemo } from 'react';
import { UseFieldArrayReturn } from 'react-hook-form';
import { LANGUAGES } from '@/tms/constants/languages';
import { ElementCreateFormType } from '../constants/formSchema';

interface UseElementLanguageOptions {
  branchLanguages?: string[];
  mainLanguage?: string;
  fields: UseFieldArrayReturn<ElementCreateFormType, 'translations'>['fields'];
}

type FieldPaths = {
  name: 'name' | `translations.${number}.name`;
  note: 'note' | `translations.${number}.note`;
  cost: 'cost' | `translations.${number}.cost`;
};

export const useElementLanguage = ({
  branchLanguages,
  mainLanguage,
  fields,
}: UseElementLanguageOptions) => {
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
  const currencySymbol =
    LANGUAGES.find((l) => l.value === effectiveLang)?.symbol ?? '$';

  const labelSuffix = effectiveLang ? ` (${effectiveLang})` : '';

  const fieldPaths: FieldPaths = {
    name:
      isMainLang || translationIndex < 0
        ? 'name'
        : `translations.${translationIndex}.name`,
    note:
      isMainLang || translationIndex < 0
        ? 'note'
        : `translations.${translationIndex}.note`,
    cost:
      isMainLang || translationIndex < 0
        ? 'cost'
        : `translations.${translationIndex}.cost`,
  };

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
