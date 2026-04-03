import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';

interface UseActiveLangOptions {
  branchId?: string;
  mainLanguage?: string;
  availableLanguages: string[];
}

/**
 * Manages page-level active language state via Jotai atom.
 *
 * - Initializes from branch data when branch changes
 * - Exposes `activeLang` and `setActiveLang` for reading/writing
 * - Avoids URL param syncing to prevent circular effects and unnecessary re-renders
 */
export const useActiveLang = ({
  branchId,
  mainLanguage,
  availableLanguages,
}: UseActiveLangOptions) => {
  const [activeLang, setActiveLang] = useAtom(activeLangAtom);
  const initializedBranchRef = useRef<string | undefined>(undefined);

  // Initialize language when branch changes or on first mount
  useEffect(() => {
    if (!branchId) return;
    if (initializedBranchRef.current === branchId) return;

    const defaultLang =
      mainLanguage || availableLanguages[0] || '';

    if (defaultLang) {
      setActiveLang(defaultLang);
      initializedBranchRef.current = branchId;
    }
  }, [branchId, mainLanguage, availableLanguages, setActiveLang]);

  // If the active language is not in the available list, fall back
  const effectiveLang =
    activeLang && availableLanguages.includes(activeLang)
      ? activeLang
      : mainLanguage || availableLanguages[0] || '';

  return {
    activeLang: effectiveLang,
    setActiveLang,
  };
};
