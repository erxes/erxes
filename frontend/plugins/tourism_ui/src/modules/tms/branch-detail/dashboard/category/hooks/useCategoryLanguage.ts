import { useState, useEffect, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { UseFieldArrayReturn } from 'react-hook-form';
import { CategoryCreateFormType } from '../constants/formSchema';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';

interface UseCategoryLanguageOptions {
  branchLanguages?: string[];
  mainLanguage?: string;
  fields: UseFieldArrayReturn<CategoryCreateFormType, 'translations'>['fields'];
}

type FieldPaths = {
  name: 'name' | `translations.${number}.name`;
};

export const useCategoryLanguage = ({
  branchLanguages,
  mainLanguage,
  fields,
}: UseCategoryLanguageOptions) => {
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

  const activeLang = useAtomValue(activeLangAtom);

  const [selectedLang, setSelectedLang] = useState(() => {
    const stored = activeLang;
    if (stored && allLanguages.includes(stored)) return stored;
    return primaryLanguage;
  });

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
