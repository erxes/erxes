import { useState, useEffect, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { UseFieldArrayReturn } from 'react-hook-form';
import { LANGUAGES } from '@/tms/constants/languages';
import { TourCreateFormType } from '../constants/formSchema';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';

interface UseTourLanguageOptions {
  branchLanguages?: string[];
  mainLanguage?: string;
  fields: UseFieldArrayReturn<TourCreateFormType, 'translations'>['fields'];
}

type FieldPaths = {
  name: 'name' | `translations.${number}.name`;
  refNumber: 'refNumber' | `translations.${number}.refNumber`;
  content: 'content' | `translations.${number}.content`;
  info1: 'info1' | `translations.${number}.info1`;
  info2: 'info2' | `translations.${number}.info2`;
  info3: 'info3' | `translations.${number}.info3`;
  info4: 'info4' | `translations.${number}.info4`;
  info5: 'info5' | `translations.${number}.info5`;
};

export const useTourLanguage = ({
  branchLanguages,
  mainLanguage,
  fields,
}: UseTourLanguageOptions) => {
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
  const currencySymbol =
    LANGUAGES.find((l) => l.value === effectiveLang)?.symbol ?? '$';

  const labelSuffix = effectiveLang ? ` (${effectiveLang})` : '';

  const fieldPaths: FieldPaths = {
    name:
      isMainLang || translationIndex < 0
        ? 'name'
        : `translations.${translationIndex}.name`,
    refNumber:
      isMainLang || translationIndex < 0
        ? 'refNumber'
        : `translations.${translationIndex}.refNumber`,
    content:
      isMainLang || translationIndex < 0
        ? 'content'
        : `translations.${translationIndex}.content`,
    info1:
      isMainLang || translationIndex < 0
        ? 'info1'
        : `translations.${translationIndex}.info1`,
    info2:
      isMainLang || translationIndex < 0
        ? 'info2'
        : `translations.${translationIndex}.info2`,
    info3:
      isMainLang || translationIndex < 0
        ? 'info3'
        : `translations.${translationIndex}.info3`,
    info4:
      isMainLang || translationIndex < 0
        ? 'info4'
        : `translations.${translationIndex}.info4`,
    info5:
      isMainLang || translationIndex < 0
        ? 'info5'
        : `translations.${translationIndex}.info5`,
  };

  return {
    allLanguages,
    translationLanguages,
    selectedLang: effectiveLang,
    setSelectedLang,
    isMainLang,
    translationIndex,
    labelSuffix,
    currencySymbol,
    fieldPaths,
  };
};
