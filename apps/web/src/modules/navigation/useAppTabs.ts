import { useAtom } from 'jotai';
import { stored } from 'erxes-ui';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { paths } from '~/lib/paths';
import { appOfPath, type NavApp, SETTINGS_APP } from './apps';

/** App ids open as tabs, in order. */
const openTabsState = stored({
  key: 'erxes:tabs:open',
  schema: z.array(z.string()),
  initial: [],
});

/** Where each app was last, so switching back returns there. */
const lastLocationState = stored({
  key: 'erxes:tabs:last',
  schema: z.record(z.string(), z.string()),
  initial: {},
});

/**
 * Browser-like app tabs: opening an app adds a tab, a tab
 * remembers where it was, closing the active tab moves to its neighbour.
 */
export const useAppTabs = (apps: NavApp[]) => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [openIds, setOpenIds] = useAtom(openTabsState);
  const [lastLocation, setLastLocation] = useAtom(lastLocationState);
  const routeApp = appOfPath([...apps, SETTINGS_APP], pathname);

  useEffect(() => {
    if (!routeApp) return;

    setLastLocation((previous) =>
      previous[routeApp.id] === pathname + search
        ? previous
        : { ...previous, [routeApp.id]: pathname + search },
    );

    if (routeApp.id !== SETTINGS_APP.id) {
      setOpenIds((previous) =>
        previous.includes(routeApp.id) ? previous : [...previous, routeApp.id],
      );
    }
  }, [routeApp, pathname, search, setLastLocation, setOpenIds]);

  const go = (path: string) => {
    void navigate(path);
  };

  const open = (app: NavApp) => go(lastLocation[app.id] ?? paths.app(app.path));

  const close = (id: string) => {
    const index = openIds.indexOf(id);
    const rest = openIds.filter((openId) => openId !== id);

    setOpenIds(rest);

    if (routeApp?.id === id) {
      const neighbour = apps.find((app) => app.id === (rest[index] ?? rest[index - 1]));

      if (neighbour) {
        open(neighbour);
      } else {
        go(paths.home);
      }
    }
  };

  /** Closes tabs and, if the active one went, moves to the first that is left. */
  const keepOnly = (keep: (id: string, index: number) => boolean) => {
    const rest = openIds.filter(keep);

    setOpenIds(rest);

    if (routeApp && !rest.includes(routeApp.id) && routeApp.id !== SETTINGS_APP.id) {
      const next = apps.find((app) => app.id === rest[0]);

      if (next) open(next);
      else go(paths.home);
    }
  };

  const closeOthers = (id: string) => keepOnly((openId) => openId === id);

  const closeToRight = (id: string) => {
    const index = openIds.indexOf(id);

    keepOnly((_openId, i) => i <= index);
  };

  /** Drag and drop: puts `fromId` where `toId` is. */
  const move = (fromId: string, toId: string) =>
    setOpenIds((previous) => {
      const from = previous.indexOf(fromId);
      const to = previous.indexOf(toId);

      if (from < 0 || to < 0) return previous;

      const next = [...previous];
      next.splice(to, 0, ...next.splice(from, 1));

      return next;
    });

  return {
    routeApp,
    // Tabs of plugins that are still loading (or gone) are kept but not drawn.
    tabs: openIds.flatMap((id) => apps.filter((app) => app.id === id)),
    open,
    close,
    closeOthers,
    closeToRight,
    move,
  };
};
