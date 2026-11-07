import { createPortal } from 'react-dom';
import {
  type ReactNode,
  type ReactPortal,
  type ReactElement,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  SidePanelDraftContext,
  SidePanelRecordPathContext,
  sidePanelHistoryState,
  useSidePanel,
  usePermissionCheck,
} from 'ui-modules';
import { PanelRecordContext } from '@/side-panel/contexts/PanelRecordContext';
import {
  getModulePanelPath,
  modulePanelEntriesState,
  modulePanelTargetsState,
} from '@/side-panel/states/modulePanelState';

export interface PagePanelOptions {
  name: string;
  identity?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  maxWidth?: number;
  defaultWidth?: number;
  expandable?: boolean;
  onExpand?: () => void;
  page?: boolean;
  requiredPermission?: string;
}
export interface PagePanelNavigation {
  onClose: () => void;
  onBack?: () => void;
  expanded: boolean;
  onExpand?: () => void;
}

export interface PagePanelEntry extends PagePanelNavigation {
  headerProps: PagePanelNavigation;
  path: string;
  name: string;
  open: boolean;
  allowed: boolean;
  permissionsLoaded: boolean;
  onOpen: () => void;
  isCurrent: () => boolean;
  target: HTMLElement | null;
  page: boolean;
}
export const PagePanelContext = createContext<PagePanelEntry | null>(null);

export const usePagePanelContext = (): PagePanelEntry => {
  const entry = useContext(PagePanelContext);
  if (!entry)
    throw new Error('A page-owned editor must provide its panel entry');
  return entry;
};

/** Registers page-owned state with the existing panel host; renders no UI. */
export const usePagePanel = ({
  name,
  identity = name,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  maxWidth,
  defaultWidth,
  onExpand,
  expandable = Boolean(onExpand),
  page = false,
  requiredPermission,
}: PagePanelOptions): PagePanelEntry => {
  const panel = useSidePanel();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const permissionsLoaded = !requiredPermission || isLoaded;
  const allowed =
    !requiredPermission || hasActionPermission(requiredPermission);
  const history = useAtomValue(sidePanelHistoryState);
  const parent = useContext(PagePanelContext);
  const parentRecord = useContext(PanelRecordContext);
  const inRecord = useContext(SidePanelDraftContext) !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const namespace =
    parent?.name ||
    (parentRecord
      ? `${parentRecord.contentType}/${parentRecord.contentId}/tab:${
          parentRecord.tab || 'detail'
        }/draft:${parentRecord.draftId || ''}`
      : '');
  const qualifiedName = namespace ? `${namespace}/${name}` : name;
  const path = getModulePanelPath(qualifiedName);
  const ownership = useRef({ path, identity, open, generation: 0 });
  const changedOwner =
    ownership.current.path !== path ||
    ownership.current.identity !== identity ||
    (open && !ownership.current.open);
  const generation = ownership.current.generation + (changedOwner ? 1 : 0);
  useLayoutEffect(() => {
    ownership.current = { path, identity, open, generation };
  });
  const isCurrent = useCallback(
    () =>
      ownership.current.path === path &&
      ownership.current.identity === identity &&
      ownership.current.generation === generation &&
      ownership.current.open,
    [path, identity, generation],
  );

  const setEntries = useSetAtom(modulePanelEntriesState);
  const previous = useRef<{ open: boolean; path: string } | null>(null);
  const previousRoute = useRef(panel.path);

  /** Keeps controlled and internal open state synchronized. */
  const changeLocalOpen = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange?.(next);
  };
  /** Dismisses this module entry while retaining the surrounding record history. */
  const leave = () => {
    panel.dismissPath(path);
  };
  /** Connects module open state with shared panel navigation. */
  const changeOpen = (next: boolean) => {
    if (!next && !page) leave();
    changeLocalOpen(next);
    if (next && !page)
      panel.openPath(path, {
        stack: Boolean(parent && !parent.page) || inRecord,
      });
  };
  const actions = useRef({
    panel,
    changeLocalOpen,
    changeOpen,
    leave,
    path,
    stack: Boolean(parent && !parent.page) || inRecord,
    onExpand,
  });
  useLayoutEffect(() => {
    actions.current = {
      panel,
      changeLocalOpen,
      changeOpen,
      leave,
      path,
      stack: Boolean(parent && !parent.page) || inRecord,
      onExpand,
    };
  });
  const canExpand = !page && expandable && Boolean(onExpand);
  const expand = useCallback(() => actions.current.onExpand?.(), []);

  useEffect(() => {
    if (page) return;
    const before = previous.current;
    const routeChanged = previousRoute.current !== panel.path;
    previousRoute.current = panel.path;
    previous.current = { open, path };
    if (before?.open && !open) {
      actions.current.panel.dismissPath(before.path);
      return;
    }
    if (
      before?.open &&
      open &&
      routeChanged &&
      panel.path !== path &&
      !history.includes(path)
    ) {
      actions.current.changeLocalOpen(false);
      return;
    }
    if (
      open &&
      (!before?.open || before.path !== path) &&
      !history.includes(path)
    ) {
      actions.current.panel.openPath(path, {
        stack: actions.current.stack,
        replace: before?.open && before.path !== path,
      });
    } else if (
      (actions.current.panel.path === path || history.includes(path)) &&
      !open
    ) {
      actions.current.changeLocalOpen(true);
    }
  }, [open, path, panel.path, history, page]);

  const retained = page
    ? open
    : open || panel.path === path || history.includes(path);
  useEffect(() => {
    if (!retained || page) return undefined;
    const entry = {
      onClose: () => {
        if (actions.current.path === path && !isCurrent()) return;
        actions.current.panel.dismissPath(path);
        if (actions.current.path === path)
          actions.current.changeLocalOpen(false);
      },
      maxWidth,
      defaultWidth,
      expandable: canExpand,
      onExpand: canExpand ? expand : undefined,
    };
    setEntries((entries) => ({ ...entries, [path]: entry }));
    return () =>
      setEntries((entries) => {
        if (entries[path] !== entry) return entries;
        return Object.fromEntries(
          Object.entries(entries).filter(([key]) => key !== path),
        );
      });
  }, [
    retained,
    path,
    setEntries,
    maxWidth,
    defaultWidth,
    canExpand,
    expand,
    page,
    isCurrent,
  ]);

  const onClose = useCallback(() => {
    if (actions.current.path === path && !isCurrent()) return;
    if (!page) actions.current.panel.dismissPath(path);
    if (actions.current.path === path) actions.current.changeLocalOpen(false);
  }, [path, isCurrent, page]);
  const onOpen = useCallback(() => actions.current.changeOpen(true), []);
  const targets = useAtomValue(modulePanelTargetsState);
  const contextValue = useMemo(() => {
    const headerProps: PagePanelNavigation = {
      onClose,
      onBack: !page && panel.canGoBack ? panel.back : undefined,
      expanded: page,
      onExpand: canExpand ? expand : undefined,
    };
    return {
      ...headerProps,
      headerProps,
      path,
      name: qualifiedName,
      open: retained,
      allowed,
      permissionsLoaded,
      onOpen,
      isCurrent,
      target: targets[path] || null,
      page,
    };
  }, [
    path,
    qualifiedName,
    retained,
    allowed,
    permissionsLoaded,
    onClose,
    onOpen,
    isCurrent,
    panel.canGoBack,
    panel.back,
    targets,
    canExpand,
    expand,
    page,
  ]);
  return contextValue;
};

/** Bridges page-owned providers into the host target without adding panel UI. */
export const createPagePanelPortal = (
  children: ReactNode,
  entry: PagePanelEntry,
): ReactPortal | ReactElement | null => {
  if (!entry.open) return null;
  const content = createElement(
    PagePanelContext.Provider,
    { value: entry },
    createElement(
      SidePanelRecordPathContext.Provider,
      { value: entry.path },
      children,
    ),
  );
  if (entry.page) return content;
  if (!entry.target) return null;
  // React DOM resolves its own React types at this external-library boundary.
  return createPortal(
    content as Parameters<typeof createPortal>[0],
    entry.target,
  ) as unknown as ReactPortal;
};
