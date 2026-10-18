import { startTransition, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AppPath } from '@/types/paths/AppPath';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IconInbox } from '@tabler/icons-react';
import { appLastLocationState } from '@/navigation/states/appLastLocationState';
import {
  findAppActivityByPath,
  isOrganizationSettingsPath,
} from '@/navigation/utils/navigationActivities';
import { openAppTabsState } from '@/navigation/states/openAppTabsState';
import { useAtom } from 'jotai';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { useTranslation } from 'react-i18next';
import {
  closeAppTab,
  moveAppTab,
  openAppTab,
  resolveAppTabIds,
} from '@/navigation/utils/appTabs';

export const INBOX_TAB_ID = 'core:my-inbox';

const toHomePath = (activity: INavigationActivity) =>
  `/${activity.defaultPath.replace(/^\/+/, '')}`;

/**
 * Browser-like app tabs: every plugin, core module and the inbox opens as a
 * tab, keeps where it was left, and can be closed or reordered.
 */
export const useAppTabs = () => {
  const navigationActivities = useNavigationActivities();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [storedTabIds, setStoredTabIds] = useAtom(openAppTabsState);
  const [lastLocations, setLastLocations] = useAtom(appLastLocationState);

  const activities = useMemo<INavigationActivity[]>(
    () => [
      ...navigationActivities,
      {
        id: INBOX_TAB_ID,
        label: t('my-inbox'),
        icon: IconInbox,
        kind: 'core',
        modules: [{ name: t('my-inbox'), path: AppPath.MyInbox }],
        defaultPath: AppPath.MyInbox,
      },
    ],
    [navigationActivities, t],
  );

  const isSettings = isOrganizationSettingsPath(pathname);
  // Organization settings is not an app tab; plugin settings live under the
  // plugin's own path, so they resolve to its tab.
  const routeActivity = isSettings
    ? undefined
    : findAppActivityByPath(activities, pathname);
  const routeActivityId = routeActivity?.id;
  const location = `${pathname}${search}`;
  const tabIds = resolveAppTabIds(storedTabIds, activities);
  const tabs = tabIds.flatMap((id) => {
    const activity = activities.find((item) => item.id === id);

    return activity ? [activity] : [];
  });

  // Remember where each app was left, like a browser tab.
  useEffect(() => {
    if (!routeActivityId) {
      return;
    }

    setLastLocations((current) =>
      current[routeActivityId] === location
        ? current
        : { ...current, [routeActivityId]: location },
    );
  }, [location, routeActivityId, setLastLocations]);

  // Whatever app the route lands on (a link, search, the inbox) gets a tab.
  useEffect(() => {
    if (!routeActivityId) {
      return;
    }

    setStoredTabIds((current) => {
      const ids = resolveAppTabIds(current, activities);

      return ids.includes(routeActivityId)
        ? current
        : openAppTab(ids, routeActivityId);
    });
  }, [activities, routeActivityId, setStoredTabIds]);

  const go = useCallback(
    (path: string) =>
      startTransition(() => {
        navigate(path);
      }),
    [navigate],
  );

  const resume = useCallback(
    (activity: INavigationActivity) =>
      go(lastLocations[activity.id] || toHomePath(activity)),
    [go, lastLocations],
  );

  const forget = useCallback(
    (ids: string[]) =>
      setLastLocations((current) => {
        const next = { ...current };

        ids.forEach((id) => delete next[id]);

        return next;
      }),
    [setLastLocations],
  );

  /** Open (or switch to) an app; re-selecting the open app goes home. */
  const selectActivity = (activity: INavigationActivity) => {
    if (activity.id === routeActivityId) {
      go(toHomePath(activity));
      return;
    }

    resume(activity);
  };

  const selectTab = (tabId: string) => {
    const activity = tabs.find((tab) => tab.id === tabId);

    if (activity && activity.id !== routeActivityId) {
      resume(activity);
    }
  };

  /** Drop tabs; when the open one goes, move to `fallbackId` or home. */
  const dropTabs = (
    remainingIds: string[],
    closedIds: string[],
    fallbackId?: string,
  ) => {
    setStoredTabIds(remainingIds);
    forget(closedIds);

    if (!routeActivityId || !closedIds.includes(routeActivityId)) {
      return;
    }

    const fallback = tabs.find((tab) => tab.id === fallbackId);

    if (fallback) {
      resume(fallback);
    } else {
      go(AppPath.Index);
    }
  };

  const closeTab = (tabId: string) => {
    const { tabIds: remaining, neighbourId } = closeAppTab(tabIds, tabId);

    dropTabs(remaining, [tabId], neighbourId);
  };

  const closeOtherTabs = (tabId: string) =>
    dropTabs(
      [tabId],
      tabIds.filter((id) => id !== tabId),
      tabId,
    );

  const closeTabsToRight = (tabId: string) => {
    const index = tabIds.indexOf(tabId);

    dropTabs(tabIds.slice(0, index + 1), tabIds.slice(index + 1), tabId);
  };

  const moveTab = (fromId: string, toId: string) =>
    setStoredTabIds(moveAppTab(tabIds, fromId, toId));

  return {
    activities,
    closeOtherTabs,
    closeTab,
    closeTabsToRight,
    moveTab,
    routeActivity,
    selectActivity,
    selectTab,
    tabs,
  };
};
