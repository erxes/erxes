import { GET_SETTINGS_SUB_NAVIGATION } from '@/settings/constants/data';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useSettingsSubNavigation = () => {
  const { t } = useTranslation(['settings', 'importExport']);
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });

  return useMemo(() => GET_SETTINGS_SUB_NAVIGATION(t, sidebarT), [t, sidebarT]);
};
