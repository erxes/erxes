import { useMultiQueryState } from 'erxes-ui';
import { atom, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';
import type { IOpenRecordOptions, ISidePanelNavigator } from './recordView';
import {
  getSidePanelRecordPath,
  NEW_RECORD_ID,
  parseSidePanelRecord,
  SIDE_PANEL_HISTORY_QUERY_KEY,
  SIDE_PANEL_QUERY_KEY,
  type TRelationEntity,
} from './sidePanelPaths';

const MAX_PANEL_HISTORY = 20;

// Panel routes left by opening a related record from inside the panel,
// newest last; the panel's back button returns to them.
export const sidePanelHistoryState = atom<string[]>([]);

/** The history entry's state: the panel's tab and the tabs of the records behind it (kept with other state). */
const RouterState = z
  .looseObject({
    sidePanel: z
      .object({
        path: z.string().nullable(),
        tab: z.string(),
        history: z.array(z.object({ path: z.string(), tab: z.string() })),
      })
      .optional(),
  })
  .nullable()
  .catch(null);

const PanelHistory = z.array(z.unknown()).catch([]);

/** Updates panel history, active route, and per-record tabs in one navigation. */
type PanelNavigate = (
  nextPath: string | null,
  nextHistory: string[],
  replace?: boolean,
  nextTab?: string,
  tabPath?: string | null,
) => void;

/**
 * The panel's route in the URL (`panel`, `panelHistory`) and the tabs kept in the
 * history entry's state, with `navigate` to change all of them at once.
 */
export const usePanelRoute = (sourcePath: string | null) => {
  const [queries, setRoute] = useMultiQueryState<{
    panel: string;
    panelHistory: string[];
    panelExpanded: boolean;
  }>([SIDE_PANEL_QUERY_KEY, SIDE_PANEL_HISTORY_QUERY_KEY, 'panelExpanded']);

  const path = typeof queries.panel === 'string' ? queries.panel : null;
  const location = useLocation();
  const routerState = RouterState.parse(location.state);
  const saved = routerState?.sidePanel;
  const navigationState = saved?.path === path ? saved : undefined;

  /** Restores the active or retained record tab from panel navigation state. */
  const getTab = (targetPath: string | null): string =>
    targetPath === path
      ? navigationState?.tab || ''
      : navigationState?.history.find((entry) => entry.path === targetPath)?.tab || '';

  const historyKey = JSON.stringify(queries.panelHistory ?? null);

  const history = useMemo(
    () =>
      PanelHistory.parse(JSON.parse(historyKey))
        .filter((entry): entry is string => typeof entry === 'string' && entry.startsWith('/'))
        .slice(-MAX_PANEL_HISTORY),
    [historyKey],
  );

  const setHistory = useSetAtom(sidePanelHistoryState);

  useEffect(() => {
    setHistory((previous) =>
      JSON.stringify(previous) === JSON.stringify(history) ? previous : history,
    );
  }, [history, setHistory]);

  const navigate: PanelNavigate = (
    nextPath,
    nextHistory,
    replace = false,
    nextTab = getTab(nextPath),
    tabPath = nextPath,
  ) => {
    setHistory(nextHistory);
    setRoute(
      {
        panel: nextPath,
        panelHistory: nextHistory.length ? nextHistory : null,
        ...(nextPath === null ? { panelExpanded: null } : {}),
      },
      {
        replace,
        state: {
          ...routerState,
          sidePanel: {
            path: nextPath,
            tab: nextPath === tabPath ? nextTab : getTab(nextPath),
            history: nextHistory.map((entry) => ({
              path: entry,
              tab: entry === tabPath ? nextTab : getTab(entry),
            })),
          },
        },
      },
    );
  };

  return { path, history, tab: getTab(sourcePath ?? path), navigate };
};

/** The panel as it is now, for actions that must not change identity between renders. */
export interface PanelNow {
  path: string | null;
  history: string[];
  navigate: PanelNavigate;
  navigator: ISidePanelNavigator | null;
  sourcePath: string | null;
}

/** Updates the owning record's tab without changing the active stack entry. */
export const setTabIn = (now: PanelNow, nextTab: string) => {
  const tabPath = now.sourcePath ?? now.path;

  if (!tabPath || (tabPath !== now.path && !now.history.includes(tabPath))) return;

  now.navigate(now.path, now.history, true, nextTab, tabPath);
};

/** Puts `next` where `previous` was (a draft once saved), Back unchanged. */
export const replaceRecordIn = (
  now: PanelNow,
  previous: TRelationEntity,
  next: TRelationEntity,
) => {
  if (now.navigator) {
    now.navigator.openRecord(next, { replace: true });

    return;
  }

  const scopedRecord = parseSidePanelRecord(now.sourcePath);

  const previousPath =
    previous.contentId === NEW_RECORD_ID &&
    scopedRecord?.contentType === previous.contentType &&
    scopedRecord.contentId === NEW_RECORD_ID &&
    now.sourcePath
      ? now.sourcePath
      : getSidePanelRecordPath(previous);

  const nextPath = getSidePanelRecordPath(next);
  const nextHistory = now.history.map((entry) => (entry === previousPath ? nextPath : entry));

  if (
    now.path === previousPath ||
    nextHistory.some((entry, index) => entry !== now.history[index])
  ) {
    now.navigate(now.path === previousPath ? nextPath : now.path, nextHistory, true);
  }
};

/** Removes every occurrence of a route, e.g. a record just deleted. */
export const dismissPathIn = (now: PanelNow, targetPath: string) => {
  const retained = now.history.filter((entry) => entry !== targetPath);

  if (now.path === targetPath) {
    now.navigate(retained.at(-1) || null, retained.slice(0, -1), true);
  } else if (retained.length !== now.history.length) {
    now.navigate(now.path, retained, true);
  }
};

/**
 * Opens, stacks, or replaces a panel path while keeping hidden stack entries. A record's
 * own page replaces itself in the stack; `startSession` marks a fresh top-level open.
 */
export const openPathIn = (
  now: PanelNow,
  nextPath: string,
  options: IOpenRecordOptions | undefined,
  startSession: () => void,
) => {
  if (options?.replace && now.sourcePath && now.sourcePath !== now.path) {
    if (now.history.includes(now.sourcePath)) {
      now.navigate(
        now.path,
        now.history.map((entry) => (entry === now.sourcePath ? nextPath : entry)),
        true,
      );
    }

    return;
  }

  if (nextPath === now.path) return;

  let nextHistory: string[] = [];

  if (options?.replace) {
    nextHistory = now.history;
  } else if (options?.stack && now.path) {
    nextHistory = [...now.history, now.path].slice(-MAX_PANEL_HISTORY);
  }

  if (!options?.stack && !options?.replace) startSession();

  now.navigate(nextPath, nextHistory, Boolean(options?.replace), '');
};
