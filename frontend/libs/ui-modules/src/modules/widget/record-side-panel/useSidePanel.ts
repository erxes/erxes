import { useMultiQueryState } from 'erxes-ui';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { matchPath } from 'react-router-dom';
import { TRelationEntity } from 'ui-modules/modules/widget/utils';
import { SIDE_PANEL_WIDTH } from 'ui-modules/modules/widget/record-side-panel/RecordSidePanel';
import { SidePanelNavigatorContext } from 'ui-modules/modules/widget/record-side-panel/recordView';

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
>(undefined);

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
export const SIDE_PANEL_DETAIL_PATH = '/detail/:typeName/:recordId/:draftId?';
// The assistant chat.
export const SIDE_PANEL_CHAT_PATH = '/chat';

// Short type names for core records; any other record uses its content
// type as the name, e.g. `/detail/sales:deal/<id>`.
const TYPE_NAME_CONTENT_TYPES: Record<string, string> = {
  customer: 'core:customer',
  company: 'core:company',
};

const CONTENT_TYPE_TYPE_NAMES = Object.fromEntries(
  Object.entries(TYPE_NAME_CONTENT_TYPES).map(([name, type]) => [type, name]),
);

export const getSidePanelRecordPath = ({
  contentType,
  contentId,
}: TRelationEntity) =>
  `/detail/${CONTENT_TYPE_TYPE_NAMES[contentType] || contentType}/${contentId}`;

export const parseSidePanelRecord = (
  path: string | null,
): TRelationEntity | null => {
  const match = path ? matchPath(SIDE_PANEL_DETAIL_PATH, path) : null;

  if (!match?.params.typeName || !match.params.recordId) {
    return null;
  }

  const { typeName, recordId } = match.params;

  return {
    contentType: TYPE_NAME_CONTENT_TYPES[typeName] || typeName,
    contentId: recordId,
  };
};

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
  }>([SIDE_PANEL_QUERY_KEY, SIDE_PANEL_HISTORY_QUERY_KEY]);
  const path = typeof queries.panel === 'string' ? queries.panel : null;
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
  const navigate = (
    nextPath: string | null,
    nextHistory: string[],
    replace = false,
  ) => {
    setHistory(nextHistory);
    setRoute(
      {
        panel: nextPath,
        panelHistory: nextHistory.length ? nextHistory : null,
      },
      { replace },
    );
  };
  const latest = useRef({ path, history, navigate, navigator, sourcePath });
  latest.current = { path, history, navigate, navigator, sourcePath };
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

  const open = !!path;
  const record = useMemo(() => parseSidePanelRecord(path), [path]);

  const openPath = (nextPath: string, options?: IOpenRecordOptions) => {
    if (nextPath === path) return;
    let nextHistory: string[] = [];
    if (options?.replace) {
      nextHistory = history;
    } else if (options?.stack && path) {
      nextHistory = [...history, path].slice(-MAX_PANEL_HISTORY);
    }
    if (!options?.stack && !options?.replace)
      setSession((session) => session + 1);
    navigate(nextPath, nextHistory, !!options?.replace);
  };

  const openRecord = (
    entity: TRelationEntity,
    options?: IOpenRecordOptions,
  ) => {
    const nextPath = getSidePanelRecordPath(entity);
    if (nextPath === path && entity.contentId === NEW_RECORD_ID) {
      if (!options?.stack && !options?.replace) {
        setSession((session) => session + 1);
        navigate(nextPath, []);
      }
      return;
    }
    openPath(nextPath, options);
  };

  const setDraft = useSetAtom(sidePanelDraftState);

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

  const close = () => {
    setDraft(null);
    navigate(null, []);
  };

  const toggle = () => (path ? close() : openPath(SIDE_PANEL_ROOT_PATH));

  const panel = {
    open,
    path,
    history,
    record,
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
          })}/${crypto.randomUUID()}`,
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
    openRecord: navigator.openRecord,
    canGoBack: navigator.canGoBack,
    back: navigator.back,
    close: navigator.close,
  };
};
