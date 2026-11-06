import {
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  UNSAFE_DataRouterStateContext,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { AppPath } from '@/types/paths/AppPath';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IconInbox, IconSettings } from '@tabler/icons-react';
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
export const SETTINGS_TAB_ID = 'core:settings';

const toHomePath = (activity: INavigationActivity) =>
  `/${activity.defaultPath.replace(/^\/+/, '')}`;

/**
 * Browser-like app tabs: every plugin, core module and the inbox opens as a
 * tab, keeps where it was left, and can be closed or reordered. Organization
 * settings keeps where it was left too, but has no tab.
 */
export const useAppTabs = () => {
  const navigationActivities = useNavigationActivities();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { t: navigationT } = useTranslation('common', {
    keyPrefix: 'navigation',
  });
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  // Observe existing editor blockers without registering a second blocker.
  const routerState = useContext(UNSAFE_DataRouterStateContext);
  const navigationBlocked = Array.from(
    routerState?.blockers.values() ?? [],
  ).some((blocker) => blocker.state === 'blocked');
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
      {
        id: SETTINGS_TAB_ID,
        label: navigationT('organization-settings'),
        icon: IconSettings,
        kind: 'core',
        modules: [
          {
            name: navigationT('organization-settings'),
            path: AppPath.Settings,
          },
        ],
        defaultPath: AppPath.Settings,
      },
    ],
    [navigationActivities, navigationT, t],
  );

  // Organization settings opens from its own top bar button and never takes a
  // tab, even one stored earlier; plugin settings live under the plugin's own
  // path, so they resolve to that plugin's tab.
  const tabActivities = useMemo(
    () => activities.filter((activity) => activity.id !== SETTINGS_TAB_ID),
    [activities],
  );
  const routeActivity = isOrganizationSettingsPath(pathname)
    ? activities.find((activity) => activity.id === SETTINGS_TAB_ID)
    : findAppActivityByPath(activities, pathname);
  const routeActivityId = routeActivity?.id;
  const location = `${pathname}${search}`;
  // Another tab action can arrive before the route transition commits.
  const pendingNavigationRef = useRef<{
    activityId?: string;
    fromLocation: string;
    routerState: typeof routerState;
    closedIds?: string[];
  } | null>(null);
  const tabIds = resolveAppTabIds(storedTabIds, tabActivities);
  const tabs = tabIds.flatMap((id) => {
    const activity = tabActivities.find((item) => item.id === id);

    return activity ? [activity] : [];
  });

  const getPendingNavigation = useCallback(() => {
    const pending = pendingNavigationRef.current;

    // A new action can run after Cancel commits but before passive cleanup.
    if (
      location === pending?.fromLocation &&
      routerState !== pending.routerState &&
      routerState?.navigation.state === 'idle' &&
      Array.from(routerState.blockers.values()).every(
        (blocker) => blocker.state === 'unblocked',
      )
    ) {
      pendingNavigationRef.current = null;
      return null;
    }

    return pending;
  }, [location, routerState]);

  const getTargetActivityId = () => {
    const pending = getPendingNavigation();

    return pending && !navigationBlocked ? pending.activityId : routeActivityId;
  };

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
    if (!routeActivityId || routeActivityId === SETTINGS_TAB_ID) {
      return;
    }

    setStoredTabIds((current) => {
      const ids = resolveAppTabIds(current, tabActivities);

      return ids.includes(routeActivityId)
        ? current
        : openAppTab(ids, routeActivityId);
    });
  }, [tabActivities, routeActivityId, setStoredTabIds]);

  const go = useCallback(
    (path: string, activityId?: string, closedIds?: string[]) => {
      const deferredIds = [
        ...new Set([
          ...(getPendingNavigation()?.closedIds ?? []),
          ...(closedIds ?? []),
        ]),
      ];

      pendingNavigationRef.current = {
        activityId,
        fromLocation: location,
        routerState,
        closedIds: deferredIds.length ? deferredIds : undefined,
      };
      startTransition(() => {
        navigate(path);
      });
    },
    [getPendingNavigation, location, navigate, routerState],
  );

  const resume = useCallback(
    (activity: INavigationActivity) =>
      go(lastLocations[activity.id] || toHomePath(activity), activity.id),
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

  useEffect(() => {
    const pending = pendingNavigationRef.current;

    if (
      !pending ||
      (routerState === pending.routerState && location === pending.fromLocation)
    ) {
      return;
    }

    if (
      pending.closedIds &&
      location !== pending.fromLocation &&
      !pending.closedIds.includes(routeActivityId ?? '')
    ) {
      const closedIds = pending.closedIds;

      setStoredTabIds((current) =>
        resolveAppTabIds(current, tabActivities).filter(
          (id) => !closedIds.includes(id),
        ),
      );
      forget(closedIds);
    }

    // A blocked navigation can finish with Cancel and no location change.
    // Keep a deferred close only while the existing blocker awaits a decision.
    if (
      routerState?.navigation.state === 'idle' &&
      Array.from(routerState.blockers.values()).every(
        (blocker) => blocker.state === 'unblocked',
      )
    ) {
      pendingNavigationRef.current = null;
    }
  }, [
    location,
    routeActivityId,
    routerState,
    tabActivities,
    setStoredTabIds,
    forget,
  ]);

  /** Open (or switch to) an app; re-selecting the open app goes home. */
  const selectActivity = (activity: INavigationActivity) => {
    if (activity.id === getTargetActivityId()) {
      go(toHomePath(activity), activity.id);
      return;
    }

    resume(activity);
  };

  const selectTab = (tabId: string) => {
    const activity = tabs.find((tab) => tab.id === tabId);

    if (activity && activity.id !== getTargetActivityId()) {
      resume(activity);
    }
  };

  /** Drop tabs; when the open one goes, move to `fallbackId` or home. */
  const dropTabs = (
    remainingIds: string[],
    closedIds: string[],
    fallbackId?: string,
  ) => {
    const targetActivityId = getTargetActivityId();
    const pending = getPendingNavigation();
    const closesCurrentRoute =
      !!routeActivityId && closedIds.includes(routeActivityId);

    if (!closesCurrentRoute) {
      setStoredTabIds(remainingIds);
      forget(closedIds);
    }

    if (!targetActivityId || !closedIds.includes(targetActivityId)) {
      if (closesCurrentRoute && pending) {
        pending.closedIds = [
          ...new Set([...(pending.closedIds ?? []), ...closedIds]),
        ];
      }
      return;
    }

    const fallback = tabs.find((tab) => tab.id === fallbackId);
    const deferredClosedIds = closesCurrentRoute ? closedIds : undefined;

    if (fallback) {
      go(
        lastLocations[fallback.id] || toHomePath(fallback),
        fallback.id,
        deferredClosedIds,
      );
    } else {
      go(AppPath.Index, undefined, deferredClosedIds);
    }
  };

  const closeTab = (tabId: string) => {
    const deferredIds = getPendingNavigation()?.closedIds ?? [];

    if (deferredIds.includes(tabId)) return;

    const { tabIds: remaining } = closeAppTab(tabIds, tabId);
    const { neighbourId } = closeAppTab(
      tabIds.filter((id) => !deferredIds.includes(id)),
      tabId,
    );

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
