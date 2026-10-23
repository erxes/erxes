import { useQueryState } from 'erxes-ui';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useCallback, useContext, useMemo } from 'react';
import { matchPath } from 'react-router-dom';
import { TRelationEntity } from '../utils';
import { SIDE_PANEL_WIDTH } from './RecordSidePanel';
import { SidePanelNavigatorContext } from './recordView';

// The side panel keeps its own route in the URL, beside the page's:
// `/contacts/customers?panel=/detail/customer/<id>`, so it can be linked,
// survives a reload and stays open while the page underneath changes.
export const SIDE_PANEL_QUERY_KEY = 'panel';

// The width the user dragged the panel to, kept across reloads.
export const sidePanelWidthState = atomWithStorage<number>(
  'erxes:sidePanelWidth',
  SIDE_PANEL_WIDTH.default,
);

// Panel routes left by opening a related record from inside the panel,
// newest last; the panel's back button returns to them.
export const sidePanelHistoryState = atom<string[]>([]);

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

// The defaults of the draft of `contentType` open in the panel, if any.
export const useSidePanelDraft = <T extends Record<string, unknown>>(
  contentType: string,
): Partial<T> => {
  const draft = useAtomValue(sidePanelDraftState);

  return draft?.contentType === contentType ? (draft.defaults as T) : {};
};

export const SIDE_PANEL_ROOT_PATH = '/';
export const SIDE_PANEL_DETAIL_PATH = '/detail/:typeName/:recordId';
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
  const [path, setPath] = useQueryState<string>(SIDE_PANEL_QUERY_KEY);
  const [history, setHistory] = useAtom(sidePanelHistoryState);

  const open = !!path;
  const record = useMemo(() => parseSidePanelRecord(path), [path]);

  const openPath = useCallback(
    (nextPath: string) => setPath(nextPath),
    [setPath],
  );

  // Opening from a list starts afresh; from inside the panel it stacks.
  const openRecord = useCallback(
    (entity: TRelationEntity, options?: IOpenRecordOptions) => {
      const nextPath = getSidePanelRecordPath(entity);

      if (nextPath === path) {
        return;
      }

      if (!options?.replace) {
        setHistory((previous) =>
          options?.stack && path ? [...previous, path] : [],
        );
      }

      setPath(nextPath);
    },
    [path, setPath, setHistory],
  );

  const setDraft = useSetAtom(sidePanelDraftState);

  const back = useCallback(() => {
    const previous = history[history.length - 1];

    if (!previous) {
      return;
    }

    setHistory(history.slice(0, -1));
    setPath(previous);
  }, [history, setHistory, setPath]);

  const close = useCallback(() => {
    setHistory([]);
    setPath(null);
  }, [setHistory, setPath]);

  const toggle = useCallback(
    () => setPath(path ? null : SIDE_PANEL_ROOT_PATH),
    [path, setPath],
  );

  const panel = {
    open,
    path,
    record,
    openPath,
    openRecord,
    // Opens a draft of `contentType` starting with `defaults`.
    openNewRecord: (
      contentType: string,
      defaults: Record<string, unknown> = {},
      options?: IOpenRecordOptions,
    ) => {
      setDraft({ contentType, defaults });
      (navigator?.openRecord ?? openRecord)(
        { contentType, contentId: NEW_RECORD_ID },
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
