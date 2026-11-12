import { useMultiQueryState } from 'erxes-ui';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';
import {
  type IOpenRecordOptions,
  SidePanelNavigatorContext,
  SidePanelRecordPathContext,
} from './recordView';
import {
  getSidePanelRecordPath,
  NEW_RECORD_ID,
  parseSidePanelRecord,
  SIDE_PANEL_HISTORY_QUERY_KEY,
  SIDE_PANEL_QUERY_KEY,
  SIDE_PANEL_ROOT_PATH,
  SIDE_PANEL_WIDTH,
  type TRelationEntity,
} from './sidePanelPaths';

const MAX_PANEL_HISTORY = 20;

// The width the user dragged the panel to, kept across reloads.
export const sidePanelWidthState = atomWithStorage<number>(
  'erxes:sidePanelWidth',
  SIDE_PANEL_WIDTH.default,
);

// Panel routes left by opening a related record from inside the panel,
// newest last; the panel's back button returns to them.
export const sidePanelHistoryState = atom<string[]>([]);
export const sidePanelSessionState = atom(0);

/** What a new contact starts with: a lead in a stage, or a customer. */
interface DraftDefaults {
  state?: 'lead' | 'customer';
  leadStageId?: string;
}

export interface ISidePanelDraft {
  contentType: string;
  defaults: DraftDefaults;
}

export const sidePanelDraftState = atom<ISidePanelDraft | null>(null);
export const SidePanelDraftContext = createContext<ISidePanelDraft | null | undefined>(undefined);

/** The defaults of the draft of `contentType` open in the panel, if any. */
export const useSidePanelDraft = (contentType: string): DraftDefaults => {
  const currentDraft = useAtomValue(sidePanelDraftState);
  const scopedDraft = useContext(SidePanelDraftContext);
  const draft = scopedDraft === undefined ? currentDraft : scopedDraft;

  return draft?.contentType === contentType ? draft.defaults : {};
};

/** The history entry's state: the panel's tab and the tabs of the records behind it (kept with other state). */
const RouterState = z
  .object({
    sidePanel: z
      .object({
        path: z.string().nullable(),
        tab: z.string(),
        history: z.array(z.object({ path: z.string(), tab: z.string() })),
      })
      .optional(),
  })
  .passthrough()
  .nullable()
  .catch(null);

/** A fresh id so two drafts of one type never share a stack entry. */
const draftId = () => Math.random().toString(36).slice(2, 12);

/**
 * Opens, closes and navigates the side panel from anywhere:
 * `openRecord({ contentType: 'core:customer', contentId })`. Inside a record
 * shown on its own page, records open there instead.
 */
export const useSidePanel = () => {
  const navigator = useContext(SidePanelNavigatorContext);
  const sourcePath = useContext(SidePanelRecordPathContext);

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

  const tab = getTab(sourcePath ?? path);
  const historyKey = JSON.stringify(queries.panelHistory ?? null);

  const history = useMemo(() => {
    const entries: unknown = JSON.parse(historyKey);

    return Array.isArray(entries)
      ? entries
          .filter(
            (entry: unknown): entry is string => typeof entry === 'string' && entry.startsWith('/'),
          )
          .slice(-MAX_PANEL_HISTORY)
      : [];
  }, [historyKey]);

  const setHistory = useSetAtom(sidePanelHistoryState);

  useEffect(() => {
    setHistory((previous) =>
      JSON.stringify(previous) === JSON.stringify(history) ? previous : history,
    );
  }, [history, setHistory]);

  /** Updates panel history, active route, and per-record tabs in one navigation. */
  const navigate = (
    nextPath: string | null,
    nextHistory: string[],
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

  const latest = useRef({ path, history, navigate, navigator, sourcePath });

  useLayoutEffect(() => {
    latest.current = { path, history, navigate, navigator, sourcePath };
  });

  /** Updates the owning record's tab without changing the active stack entry. */
  const setTab = useCallback((nextTab: string) => {
    const current = latest.current;
    const tabPath = current.sourcePath ?? current.path;

    if (!tabPath || (tabPath !== current.path && !current.history.includes(tabPath))) return;

    current.navigate(current.path, current.history, true, nextTab, tabPath);
  }, []);

  /** Puts `next` where `previous` was (a draft once saved), Back unchanged. */
  const replaceRecord = useCallback((previous: TRelationEntity, next: TRelationEntity) => {
    const current = latest.current;

    if (current.navigator) {
      current.navigator.openRecord(next, { replace: true });

      return;
    }

    const scopedRecord = parseSidePanelRecord(current.sourcePath);

    const previousPath =
      previous.contentId === NEW_RECORD_ID &&
      scopedRecord?.contentType === previous.contentType &&
      scopedRecord.contentId === NEW_RECORD_ID &&
      current.sourcePath
        ? current.sourcePath
        : getSidePanelRecordPath(previous);

    const nextPath = getSidePanelRecordPath(next);
    const nextHistory = current.history.map((entry) => (entry === previousPath ? nextPath : entry));

    if (
      current.path === previousPath ||
      nextHistory.some((entry, index) => entry !== current.history[index])
    ) {
      current.navigate(current.path === previousPath ? nextPath : current.path, nextHistory, true);
    }
  }, []);

  const setSession = useSetAtom(sidePanelSessionState);
  const setDraft = useSetAtom(sidePanelDraftState);
  const open = Boolean(path);
  const record = useMemo(() => parseSidePanelRecord(path), [path]);

  /** Opens, stacks, or replaces a panel path while keeping hidden stack entries. */
  const openPath = (nextPath: string, options?: IOpenRecordOptions) => {
    const current = latest.current;

    if (options?.replace && current.sourcePath && current.sourcePath !== current.path) {
      if (current.history.includes(current.sourcePath)) {
        current.navigate(
          current.path,
          current.history.map((entry) => (entry === current.sourcePath ? nextPath : entry)),
          true,
        );
      }

      return;
    }

    if (nextPath === path) return;

    let nextHistory: string[] = [];

    if (options?.replace) {
      nextHistory = history;
    } else if (options?.stack && path) {
      nextHistory = [...history, path].slice(-MAX_PANEL_HISTORY);
    }

    if (!options?.stack && !options?.replace) setSession((session) => session + 1);

    navigate(nextPath, nextHistory, Boolean(options?.replace), '');
  };

  /** Opens a record; a repeated top-level draft starts a fresh session. */
  const openRecord = (entity: TRelationEntity, options?: IOpenRecordOptions) => {
    const nextPath = getSidePanelRecordPath(entity);

    if (nextPath === path && entity.contentId === NEW_RECORD_ID) {
      if (!options?.stack && !options?.replace) {
        setSession((session) => session + 1);
        navigate(nextPath, [], false, '');
      }

      return;
    }

    openPath(nextPath, options);
  };

  /** Returns to the last retained panel route without changing the page route. */
  const back = () => {
    const previous = history[history.length - 1];

    if (previous) navigate(previous, history.slice(0, -1));
  };

  /** Removes every occurrence of a route, e.g. a record just deleted. */
  const dismissPath = useCallback((targetPath: string) => {
    const current = latest.current;
    const retained = current.history.filter((entry) => entry !== targetPath);

    if (current.path === targetPath) {
      current.navigate(retained.at(-1) || null, retained.slice(0, -1), true);
    } else if (retained.length !== current.history.length) {
      current.navigate(current.path, retained, true);
    }
  }, []);

  /** Discards draft defaults and clears the panel route and history. */
  const close = () => {
    setDraft(null);
    navigate(null, []);
  };

  const panel = {
    open,
    path,
    history,
    record,
    tab,
    setTab,
    openPath,
    openRecord,
    replaceRecord,
    dismissPath,
    // Opens a draft of `contentType` starting with `defaults`.
    openNewRecord: (
      contentType: string,
      defaults: DraftDefaults = {},
      options?: IOpenRecordOptions,
    ) => {
      setDraft({ contentType, defaults });

      if (navigator) {
        navigator.openRecord({ contentType, contentId: NEW_RECORD_ID }, options);
      } else {
        openPath(
          `${getSidePanelRecordPath({ contentType, contentId: NEW_RECORD_ID })}/${draftId()}`,
          options,
        );
      }
    },
    canGoBack: history.length > 0,
    back,
    close,
    toggle: () => (path ? close() : openPath(SIDE_PANEL_ROOT_PATH)),
  };

  if (!navigator) {
    return panel;
  }

  return {
    ...panel,
    record: navigator.record,
    tab: navigator.tab,
    setTab: navigator.setTab,
    openRecord: navigator.openRecord,
    canGoBack: navigator.canGoBack,
    back: navigator.back,
    close: navigator.close,
  };
};
