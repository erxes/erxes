import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';

import { iconsState } from '../states/iconsState';

export const IconsProvider = ({ children }: { children: ReactNode }) => {
  const setIcons = useSetAtom(iconsState);

  useEffect(() => {
    void import('../components/TablerIcons').then((icons) => setIcons({ ...icons }));
  }, [setIcons]);

  return children;
};
