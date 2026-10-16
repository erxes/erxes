import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { getAppColor } from '@/navigation/utils/getAppColor';
import { useEffect } from 'react';

/**
 * Tints the whole document with the app's color, so portaled popovers,
 * dialogs and the mobile sidebar match the app too.
 */
export const useAppTheme = (app?: INavigationActivity) => {
  const color = app && getAppColor(app);

  useEffect(() => {
    if (!color) return;

    const { style } = document.documentElement;

    style.setProperty('--primary', color);
    style.setProperty('--color-primary', color);

    return () => {
      style.removeProperty('--primary');
      style.removeProperty('--color-primary');
    };
  }, [color]);
};
