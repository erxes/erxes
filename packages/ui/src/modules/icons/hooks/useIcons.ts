import { useAtomValue } from 'jotai';

import { iconsState } from '../states/iconsState';
import { Icon123 } from '@tabler/icons-react';

export const useIcons = () => {
  const icons = useAtomValue(iconsState);
  const defaultIcon = Icon123;

  const getIcons = () => {
    return icons;
  };

  const getIcon = (iconKey?: string | null) => {
    if (!iconKey) {
      return defaultIcon;
    }

    return icons[iconKey] ?? defaultIcon;
  };

  return { getIcons, getIcon };
};
