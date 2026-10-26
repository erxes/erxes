import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useVersion } from 'ui-modules';

import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import {
  GET_SETTINGS_PATH_DATA,
  GET_SETTINGS_SUB_NAVIGATION,
} from '@/settings/constants/data';
import {
  buildNavigationCatalog,
  type IAgentsNavigationEntry,
} from '../utils/navigationCatalog';

/**
 * Pages always navigable for this user that no activity or settings
 * entry already names: the notifications inbox.
 */
const FIXED_PAGES: IAgentsNavigationEntry[] = [
  { path: '/my-inbox', label: 'My inbox' },
];

/**
 * The user's navigable-page catalog sent with every chat turn. Rebuilt
 * with the same inputs the real sidebar uses, so it stays permission- and
 * language-aware without a second source of truth.
 */
export const useNavigationCatalog = (): IAgentsNavigationEntry[] => {
  const activities = useNavigationActivities();
  const version = useVersion();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { t: settingsT } = useTranslation(['settings', 'importExport']);

  return useMemo(() => {
    const pathData = GET_SETTINGS_PATH_DATA(version, t);
    const settingsSubNavigation = GET_SETTINGS_SUB_NAVIGATION(settingsT, t);

    return buildNavigationCatalog({
      activities,
      settingsGroups: [pathData.account, pathData.nav, pathData.developer],
      settingsSubNavigation,
      fixed: FIXED_PAGES,
    });
  }, [activities, settingsT, t, version]);
};
