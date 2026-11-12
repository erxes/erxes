import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';

import { iconsState } from '../states/iconsState';

export const IconsProvider = ({ children }: { children: ReactElement }) => {
  const setIcons = useSetAtom(iconsState);

  useEffect(() => {
    void import('../components/TablerIcons').then((icons) => setIcons({ ...icons }));
  }, [setIcons]);

  return children;
};
