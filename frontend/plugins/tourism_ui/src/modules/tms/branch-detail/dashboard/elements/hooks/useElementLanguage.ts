import { useState, useEffect, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { LANGUAGES } from '@/tms/constants/languages';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';

interface UseElementLanguageOptions {
  branchLanguages?: string[];
  mainLanguage?: string;
}

type FieldPaths = {
  name: 'name' | `translations.${number}.name`;
  note: 'note' | `translations.${number}.note`;
  cost: 'cost' | `translations.${number}.cost`;
};

export const useElementLanguage = ({
  branchLanguages,
  mainLanguage,
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
  const translationIndex = translationLanguages.indexOf(effectiveLang);
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
