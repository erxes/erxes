import { useState, useEffect, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { UseFieldArrayReturn } from 'react-hook-form';
import { LANGUAGES } from '@/tms/constants/languages';
import { ItineraryCreateFormType } from '../constants/formSchema';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';

interface UseItineraryLanguageOptions {
  branchLanguages?: string[];
  mainLanguage?: string;
  fields: UseFieldArrayReturn<
    ItineraryCreateFormType,
    'translations'
  >['fields'];
}

type FieldPaths = {
  name: 'name' | `translations.${number}.name`;
  content: 'content' | `translations.${number}.content`;
  foodCost: 'foodCost' | `translations.${number}.foodCost`;
  gasCost: 'gasCost' | `translations.${number}.gasCost`;
  driverCost: 'driverCost' | `translations.${number}.driverCost`;
  guideCost: 'guideCost' | `translations.${number}.guideCost`;
  guideCostExtra: 'guideCostExtra' | `translations.${number}.guideCostExtra`;
};

export const useItineraryLanguage = ({
  branchLanguages,
  mainLanguage,
  fields,
}: UseItineraryLanguageOptions) => {
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
    content:
      isMainLang || translationIndex < 0
        ? 'content'
        : `translations.${translationIndex}.content`,
    foodCost:
      isMainLang || translationIndex < 0
        ? 'foodCost'
        : `translations.${translationIndex}.foodCost`,
    gasCost:
      isMainLang || translationIndex < 0
        ? 'gasCost'
        : `translations.${translationIndex}.gasCost`,
    driverCost:
      isMainLang || translationIndex < 0
        ? 'driverCost'
        : `translations.${translationIndex}.driverCost`,
    guideCost:
      isMainLang || translationIndex < 0
        ? 'guideCost'
        : `translations.${translationIndex}.guideCost`,
    guideCostExtra:
      isMainLang || translationIndex < 0
        ? 'guideCostExtra'
        : `translations.${translationIndex}.guideCostExtra`,
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
