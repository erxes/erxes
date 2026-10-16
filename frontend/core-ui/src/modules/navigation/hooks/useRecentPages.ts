import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePluginsModules } from '@/navigation/hooks/usePluginsNavigationGroups';
import { recentPagesState } from '@/navigation/states/appPlacesState';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import { getVisitedPageTabLabel } from '@/navigation/utils/visitedPageTabs';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

/** Pages visited inside apps, newest first, each tagged with its app. */
export const useRecentPages = () => {
  const { t } = useTranslation('common');
  const pages = useAtomValue(recentPagesState);
  const activities = useNavigationActivities();
  const modules = usePluginsModules() ?? [];
  const labels = {
    details: t('navigation.details'),
    myInbox: t('my-inbox'),
  };

  return pages.flatMap(({ to, visitedAt }) => {
    const pathname = to.split('?')[0];
    const activity = findNavigationActivityByPath(activities, pathname);

    if (!activity) return [];

    return [
      {
        to,
        visitedAt,
        label: getVisitedPageTabLabel(pathname, modules, labels),
        activity,
      },
    ];
  });
};
