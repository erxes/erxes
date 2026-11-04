import { useMemo } from 'react';
import { IBranch } from '@/tms/types/branch';
import { compactList } from '~/utils/cursorList';

export const useBranchLanguages = (
  branch?: Pick<IBranch, 'language' | 'languages'> | null,
) => {
  const languages = branch?.languages;
  const branchLanguages = useMemo(() => compactList(languages), [languages]);

  return {
    branchLanguages,
    mainLanguage: branch?.language ?? undefined,
  };
};
