import { useEffect } from 'react';
import { useSetAtom } from 'jotai';

import { iconsState } from '../states/iconsState';

type IconsProviderProps = {
  children: JSX.Element;
};

export const IconsProvider = ({ children }: IconsProviderProps) => {
  const setIcons = useSetAtom(iconsState);

  useEffect(() => {
    import('../components/TablerIcons').then((Icons) => {
      setIcons(Icons.ALL_ICONS);
    });
  }, [setIcons]);

  return children;
};
