import { atom, useAtomValue, useSetAtom } from 'jotai';
import { stored } from 'erxes-ui';
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { z } from 'zod';
import {
  dismissPathIn,
  openPathIn,
  type PanelNow,
  replaceRecordIn,
  setTabIn,
  usePanelRoute,
} from './panelNavigation';
import {
  type IOpenRecordOptions,
  SidePanelNavigatorContext,
  SidePanelRecordPathContext,
} from './recordView';
import {
  getSidePanelRecordPath,
  NEW_RECORD_ID,
  parseSidePanelRecord,
  SIDE_PANEL_ROOT_PATH,
  SIDE_PANEL_WIDTH,
  type TRelationEntity,
} from './sidePanelPaths';

// The width the user dragged the panel to, kept across reloads.
export const sidePanelWidthState = stored({
  key: 'erxes:side-panel:width',
  schema: z.number().min(SIDE_PANEL_WIDTH.min).max(SIDE_PANEL_WIDTH.max),
  initial: SIDE_PANEL_WIDTH.default,
});

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

/** A fresh id so two drafts of one type never share a stack entry. */
const draftId = () => Math.random().toString(36).slice(2, 12);

/** The panel's latest route, for actions that keep their identity across renders. */
const useLatestPanel = (now: PanelNow) => {
  const latest = useRef(now);

  useLayoutEffect(() => {
    latest.current = now;
  });

  return {
    latest,
    setTab: useCallback((nextTab: string) => setTabIn(latest.current, nextTab), []),
    replaceRecord: useCallback(
      (previous: TRelationEntity, next: TRelationEntity) =>
        replaceRecordIn(latest.current, previous, next),
      [],
    ),
    dismissPath: useCallback((targetPath: string) => dismissPathIn(latest.current, targetPath), []),
  };
};

/**
 * Opens, closes and navigates the side panel from anywhere:
 * `openRecord({ contentType: 'core:customer', contentId })`. Inside a record
 * shown on its own page, records open there instead.
 */
export const useSidePanel = () => {
  const navigator = useContext(SidePanelNavigatorContext);
  const sourcePath = useContext(SidePanelRecordPathContext);
  const { path, history, tab, navigate } = usePanelRoute(sourcePath);
  const { latest, ...stable } = useLatestPanel({ path, history, navigate, navigator, sourcePath });
  const setSession = useSetAtom(sidePanelSessionState);
  const setDraft = useSetAtom(sidePanelDraftState);
  const record = useMemo(() => parseSidePanelRecord(path), [path]);

  // The open actions read the route at call time, so they keep one identity and the
  // table cells that only open records skip rendering when the panel changes.
  const openPath = (nextPath: string, options?: IOpenRecordOptions) =>
    openPathIn(latest.current, nextPath, options, () => setSession((session) => session + 1));

  /** Opens a record; a repeated top-level draft starts a fresh session. */
  const openRecord = (entity: TRelationEntity, options?: IOpenRecordOptions) => {
    const now = latest.current;
    const nextPath = getSidePanelRecordPath(entity);

    if (nextPath !== now.path || entity.contentId !== NEW_RECORD_ID) {
      openPath(nextPath, options);

      return;
    }

    if (!options?.stack && !options?.replace) {
      setSession((session) => session + 1);
      now.navigate(nextPath, [], false, '');
    }
  };

  /** Discards draft defaults and clears the panel route and history. */
  const close = () => {
    setDraft(null);
    navigate(null, []);
  };

  /** Opens a draft of `contentType` starting with `defaults`. */
  const openNewRecord = (
    contentType: string,
    defaults: DraftDefaults = {},
    options?: IOpenRecordOptions,
  ) => {
    setDraft({ contentType, defaults });

    const entity = { contentType, contentId: NEW_RECORD_ID };
    const now = latest.current;

    if (now.navigator) now.navigator.openRecord(entity, options);
    else openPath(`${getSidePanelRecordPath(entity)}/${draftId()}`, options);
  };

  const panel = {
    open: Boolean(path),
    path,
    history,
    record,
    tab,
    ...stable,
    openPath,
    openRecord,
    openNewRecord,
    canGoBack: history.length > 0,
    // Returns to the last retained panel route without changing the page route.
    back: () => {
      const previous = history.at(-1);

      if (previous) navigate(previous, history.slice(0, -1));
    },
    close,
    toggle: () => (path ? close() : openPath(SIDE_PANEL_ROOT_PATH)),
  };

  if (!navigator) return panel;

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
