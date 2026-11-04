import {
  getSidePanelRecordPath,
  parseSidePanelRecord,
} from 'ui-modules/modules/widget/record-side-panel/useSidePanelUtils';
import { useMultiQueryState } from 'erxes-ui';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { nanoid } from 'nanoid';
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
import { TRelationEntity } from 'ui-modules/modules/widget/utils';
import { SIDE_PANEL_WIDTH } from 'ui-modules/modules/widget/record-side-panel/RecordSidePanel';
import { SidePanelNavigatorContext } from 'ui-modules/modules/widget/record-side-panel/recordView';

export {
  SIDE_PANEL_DETAIL_PATH,
  getSidePanelRecordPath,
  parseSidePanelRecord,
} from 'ui-modules/modules/widget/record-side-panel/useSidePanelUtils';

// The side panel keeps its own route in the URL, beside the page's:
// `/contacts/customers?panel=/detail/customer/<id>`, so it can be linked,
// survives a reload and stays open while the page underneath changes.
export const SIDE_PANEL_QUERY_KEY = 'panel';
export const SIDE_PANEL_HISTORY_QUERY_KEY = 'panelHistory';
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

interface ISidePanelNavigationState {
  path: string | null;
  tab: string;
  history: { path: string; tab: string }[];
}

export interface IOpenRecordOptions {
  // Opened from inside the panel (a related record): Back returns here.
  stack?: boolean;
  // Takes the open record's place, Back unchanged: a draft once saved.
  replace?: boolean;
}

/**
 * The id of a record not created yet: `/detail/<type>/new` shows a draft of
 * that type. Nothing is saved until its first value (the name) is; the
 * draft is then created in one mutation and replaced by the record.
 */
export const NEW_RECORD_ID = 'new';

export interface ISidePanelDraft {
  contentType: string;
  // What the new record starts with: its team, status, the customer it is
  // created for, ... — read by whoever draws that type's draft.
  defaults: Record<string, unknown>;
}

export const sidePanelDraftState = atom<ISidePanelDraft | null>(null);
export const SidePanelDraftContext = createContext<
  ISidePanelDraft | null | undefined
>(undefined); // skipcq: JS-W1042 -- React 18 requires this default argument.

// The defaults of the draft of `contentType` open in the panel, if any.
export const useSidePanelDraft = <T extends Record<string, unknown>>(
  contentType: string,
): Partial<T> => {
  const currentDraft = useAtomValue(sidePanelDraftState);
  const scopedDraft = useContext(SidePanelDraftContext);
  const draft = scopedDraft === undefined ? currentDraft : scopedDraft;

  return draft?.contentType === contentType ? (draft.defaults as T) : {};
};

export const SidePanelRecordPathContext = createContext<string | null>(null);

export const SIDE_PANEL_ROOT_PATH = '/';
// The assistant chat.
export const SIDE_PANEL_CHAT_PATH = '/chat';

/**
 * Opens, closes and navigates the side panel from anywhere, plugins
 * included: `openRecord({ contentType: 'core:customer', contentId })`.
 * Inside a record shown outside the panel (`EmbeddedRecordPanel`), records
 * open there instead.
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
  const routerState = location.state as {
    sidePanel?: ISidePanelNavigationState;
  } | null;
  const saved = routerState?.sidePanel;
  const navigationState = saved?.path === path ? saved : undefined;
  /** Restores the active or retained record tab from panel navigation state. */
  const getTab = (targetPath: string | null): string =>
    targetPath === path
      ? navigationState?.tab || ''
      : navigationState?.history.find((entry) => entry.path === targetPath)
          ?.tab || '';
  const tab = getTab(sourcePath ?? path);
  const historyKey = JSON.stringify(queries.panelHistory ?? null);
  const history = useMemo(() => {
    const entries: unknown = JSON.parse(historyKey);
    return Array.isArray(entries)
      ? entries
          .filter(
            (entry: unknown): entry is string =>
              typeof entry === 'string' && entry.startsWith('/'),
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
            tab: nextTab,
            history: nextHistory.map((entry) => ({
              path: entry,
              tab: getTab(entry),
            })),
          },
        },
      },
    );
  };
  /** Replaces the active navigation entry with its selected record tab. */
  const setTab = (nextTab: string) => navigate(path, history, true, nextTab);
  const latest = useRef({ path, history, navigate, navigator, sourcePath });
  useLayoutEffect(() => {
    latest.current = { path, history, navigate, navigator, sourcePath };
  });
  const replaceRecord = useCallback(
    (previous: TRelationEntity, next: TRelationEntity) => {
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
      const nextHistory = current.history.map((entry) =>
        entry === previousPath ? nextPath : entry,
      );
      if (
        current.path === previousPath ||
        nextHistory.some((entry, index) => entry !== current.history[index])
      ) {
        current.navigate(
          current.path === previousPath ? nextPath : current.path,
          nextHistory,
          true,
        );
      }
    },
    [],
  );

  const setSession = useSetAtom(sidePanelSessionState);

  const open = Boolean(path);
  const record = useMemo(() => parseSidePanelRecord(path), [path]);

  /** Opens, stacks, or replaces a panel path while preserving hidden source entries. */
  const openPath = (nextPath: string, options?: IOpenRecordOptions) => {
    const current = latest.current;
    if (
      options?.replace &&
      current.sourcePath &&
      current.sourcePath !== current.path
    ) {
      if (current.history.includes(current.sourcePath)) {
        current.navigate(
          current.path,
          current.history.map((entry) =>
            entry === current.sourcePath ? nextPath : entry,
          ),
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
    if (!options?.stack && !options?.replace)
      setSession((session) => session + 1);
    navigate(nextPath, nextHistory, Boolean(options?.replace), '');
  };

  /** Opens an entity route and starts a fresh session for a repeated top-level draft. */
  const openRecord = (
    entity: TRelationEntity,
    options?: IOpenRecordOptions,
  ) => {
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

  const setDraft = useSetAtom(sidePanelDraftState);

  /** Returns to the last retained panel route without changing the page route. */
  const back = () => {
    const previous = history[history.length - 1];
    if (previous) navigate(previous, history.slice(0, -1));
  };

  // A hidden editor can finish saving while a related record stays active.
  const dismissPath = (targetPath: string) => {
    if (path === targetPath) {
      const previous = history[history.length - 1];
      navigate(previous || null, history.slice(0, -1), true);
    } else if (history.includes(targetPath)) {
      navigate(
        path,
        history.filter((entry) => entry !== targetPath),
        true,
      );
    }
  };

  /** Discards draft defaults and clears the panel route and history. */
  const close = () => {
    setDraft(null);
    navigate(null, []);
  };

  /** Closes an open panel or opens the panel root. */
  const toggle = () => (path ? close() : openPath(SIDE_PANEL_ROOT_PATH));

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
      defaults: Record<string, unknown> = {},
      options?: IOpenRecordOptions,
    ) => {
      setDraft({ contentType, defaults });
      if (navigator)
        navigator.openRecord(
          { contentType, contentId: NEW_RECORD_ID },
          options,
        );
      else
        openPath(
          `${getSidePanelRecordPath({
            contentType,
            contentId: NEW_RECORD_ID,
          })}/${nanoid()}`,
          options,
        );
    },
    canGoBack: history.length > 0,
    back,
    close,
    toggle,
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
