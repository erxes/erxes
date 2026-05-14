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

  // Initialize language when branch changes or on first mount.
  // Prefer the persisted atom value if it is valid for this branch,
  // otherwise fall back to mainLanguage → first available language.
  useEffect(() => {
    if (!branchId) return;
    if (initializedBranchRef.current === branchId) return;

    const storedIsValid = activeLang && availableLanguages.includes(activeLang);

    const langToUse = storedIsValid
      ? activeLang
      : mainLanguage || availableLanguages[0] || '';

    if (langToUse) {
      setActiveLang(langToUse);
      initializedBranchRef.current = branchId;
    }
  }, [branchId, mainLanguage, availableLanguages, activeLang, setActiveLang]);

  // If the active language is not in the available list, fall back
  const effectiveLang =
    activeLang && availableLanguages.includes(activeLang)
      ? activeLang
      : mainLanguage || availableLanguages[0] || '';

  // Sync atom back when it holds a stale/invalid value not in availableLanguages
  useEffect(() => {
    if (effectiveLang && activeLang !== effectiveLang) {
      setActiveLang(effectiveLang);
    }
  }, [effectiveLang, activeLang, setActiveLang]);

  return {
    activeLang: effectiveLang,
    setActiveLang,
  };
};
