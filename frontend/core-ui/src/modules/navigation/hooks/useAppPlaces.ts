import { useCurrentApp } from '@/navigation/hooks/useCurrentApp';
import { usePluginsModules } from '@/navigation/hooks/usePluginsNavigationGroups';
import {
  appPlacesState,
  lastAppIdState,
  recentPagesState,
} from '@/navigation/states/appPlacesState';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { AppPath } from '@/types/paths/AppPath';
import { getVisitedPageTabLabel } from '@/navigation/utils/visitedPageTabs';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const RECENT_PAGES_LIMIT = 50;

export const getAppDefaultPath = (app: INavigationActivity) =>
  `/${app.defaultPath.replace(/^\/+/, '')}`;

/**
 * Records the current page, outside settings, as where its app resumes and as
 * the newest entry in recent pages.
 */
export const useRememberAppPlace = () => {
  const app = useCurrentApp();
  const { pathname, search } = useLocation();
  const setPlaces = useSetAtom(appPlacesState);
  const setLastAppId = useSetAtom(lastAppIdState);
  const setRecentPages = useSetAtom(recentPagesState);

  useEffect(() => {
    if (!app || pathname.startsWith(`/${AppPath.Settings}`)) return;

    const to = `${pathname}${search}`;

    setPlaces((places) => ({ ...places, [app.id]: to }));
    setLastAppId(app.id);
    setRecentPages((pages) =>
      [
        { to, visitedAt: Date.now() },
        ...pages.filter((page) => page.to.split('?')[0] !== pathname),
      ].slice(0, RECENT_PAGES_LIMIT),
    );
  }, [app, pathname, search, setPlaces, setLastAppId, setRecentPages]);
};

/** Where each app resumes, with a readable label for that page. */
export const useAppPlaces = () => {
  const { t } = useTranslation('common');
  const places = useAtomValue(appPlacesState);
  const modules = usePluginsModules() ?? [];
  const labels = {
    details: t('navigation.details'),
    myInbox: t('my-inbox'),
  };

  const placeOf = (app: INavigationActivity) => {
    const to = places[app.id];

    if (!to || to === getAppDefaultPath(app)) {
      return { to: getAppDefaultPath(app), label: null };
    }

    return {
      to,
      label: getVisitedPageTabLabel(to.split('?')[0], modules, labels),
    };
  };

  return { placeOf };
};
