import { Button, cn, Empty, FocusSheet, Sheet, Spinner } from 'erxes-ui';
import { IconChevronLeft } from '@tabler/icons-react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  ComponentProps,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { PanelRecordContext } from '@/side-panel/contexts/PanelRecordContext';
import {
  SidePanelDraftContext,
  RecordSidePanel,
  sidePanelHistoryState,
  useSidePanel,
  usePermissionCheck,
} from 'ui-modules';
import {
  getModulePanelPath,
  modulePanelEntriesState,
  modulePanelTargetsState,
} from '@/side-panel/states/modulePanelState';

type TModulePanelProps = ComponentProps<typeof Sheet> & {
  name: string;
  maxWidth?: number;
  defaultWidth?: number;
  requiredPermission?: string;
};

const ModulePanelContext = createContext<{
  path: string;
  name: string;
  open: boolean;
  allowed: boolean;
  onClose: () => void;
  onOpen: () => void;
} | null>(null);

// Page-owned editors use the same app-wide column as records. The existing
// Sheet/FocusSheet roots only supply trigger, close and form-widget contexts;
// their modal view and overlay are never mounted.
const ModulePanelRoot = ({
  name,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  maxWidth,
  defaultWidth,
  requiredPermission,
  focus = false,
  children,
}: TModulePanelProps & { focus?: boolean }) => {
  const panel = useSidePanel();
  const { hasActionPermission } = usePermissionCheck();
  const allowed =
    !requiredPermission || hasActionPermission(requiredPermission);
  const history = useAtomValue(sidePanelHistoryState);
  const parent = useContext(ModulePanelContext);
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
  const setEntries = useSetAtom(modulePanelEntriesState);
  const previous = useRef<{ open: boolean; path: string } | null>(null);
  const previousRoute = useRef(panel.path);

  const changeLocalOpen = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange?.(next);
  };
  const leave = () => {
    panel.dismissPath(path);
  };
  const changeOpen = (next: boolean) => {
    if (!next) leave();
    changeLocalOpen(next);
    if (next) panel.openPath(path, { stack: !!parent || inRecord });
  };
  const actions = useRef({
    panel,
    changeLocalOpen,
    changeOpen,
    leave,
    stack: !!parent || inRecord,
  });
  actions.current = {
    panel,
    changeLocalOpen,
    changeOpen,
    leave,
    stack: !!parent || inRecord,
  };

  useEffect(() => {
    const before = previous.current;
    const routeChanged = previousRoute.current !== panel.path;
    previousRoute.current = panel.path;
    previous.current = { open, path };
    if (before?.open && !open) {
      actions.current.leave();
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
  }, [open, path, panel.path, history]);

  const retained = open || panel.path === path || history.includes(path);
  useEffect(() => {
    if (!retained) return;
    const entry = {
      onClose: () => actions.current.changeOpen(false),
      maxWidth,
      defaultWidth,
    };
    setEntries((entries) => ({ ...entries, [path]: entry }));
    return () =>
      setEntries((entries) => {
        if (entries[path] !== entry) return entries;
        const next = { ...entries };
        delete next[path];
        return next;
      });
  }, [retained, path, setEntries, maxWidth, defaultWidth]);

  const Root = focus ? FocusSheet : Sheet;
  return (
    <ModulePanelContext.Provider
      value={{
        path,
        name: qualifiedName,
        open: retained,
        allowed,
        onClose: () => changeOpen(false),
        onOpen: () => changeOpen(true),
      }}
    >
      <Root open={retained} onOpenChange={changeOpen} modal={false}>
        {children}
      </Root>
    </ModulePanelContext.Provider>
  );
};

const ModulePanelView = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof Sheet.View> & {
    loading?: boolean;
    error?: boolean;
    notFound?: boolean;
    errorState?: React.ReactNode;
    notFoundState?: React.ReactNode;
  }
>(
  (
    {
      className,
      children,
      loading,
      error,
      notFound,
      errorState,
      notFoundState,
    },
    ref,
  ) => {
    const context = useContext(ModulePanelContext);
    const panel = useSidePanel();
    const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
    const targets = useAtomValue(modulePanelTargetsState);
    const target = context && targets[context.path];
    if (!context?.open || !target) return null;
    return (
      <>
        {createPortal(
          <div
            ref={ref}
            className={cn(
              'flex min-h-0 flex-1 flex-col overflow-hidden bg-background',
              className,
              'relative! inset-auto! h-full! w-full! min-w-0! max-w-none! rounded-none! shadow-none!',
            )}
          >
            {!context.allowed || loading || error || notFound ? (
              <>
                <RecordSidePanel.Header
                  title={
                    !context.allowed
                      ? t('access-denied', 'Access denied')
                      : loading
                      ? t('loading', 'Loading…')
                      : error
                      ? t('error', 'Unable to load editor')
                      : t('not-found-title', 'Nothing here')
                  }
                  onClose={context.onClose}
                  onBack={panel.canGoBack ? panel.back : undefined}
                />
                {!context.allowed ? (
                  <Empty>
                    <Empty.Header>
                      <Empty.Title>
                        {t('access-denied', 'Access denied')}
                      </Empty.Title>
                    </Empty.Header>
                  </Empty>
                ) : loading ? (
                  <Spinner containerClassName="py-12" />
                ) : error ? (
                  errorState || (
                    <Empty>
                      <Empty.Header>
                        <Empty.Title>
                          {t('error', 'Unable to load editor')}
                        </Empty.Title>
                      </Empty.Header>
                    </Empty>
                  )
                ) : (
                  notFoundState || (
                    <Empty>
                      <Empty.Header>
                        <Empty.Title>
                          {t('not-found-title', 'Nothing here')}
                        </Empty.Title>
                      </Empty.Header>
                    </Empty>
                  )
                )}
              </>
            ) : (
              children
            )}
          </div>,
          target,
        )}
      </>
    );
  },
);
ModulePanelView.displayName = 'ModulePanelView';

const ModulePanelBack = () => {
  const { back, canGoBack } = useSidePanel();
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  return canGoBack ? (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7 shrink-0"
      aria-label={t('back', 'Back')}
      onClick={back}
    >
      <IconChevronLeft />
    </Button>
  ) : null;
};

const ModulePanelHeader = ({
  className,
  children,
  ...props
}: ComponentProps<typeof Sheet.Header>) => (
  <Sheet.Header
    className={cn('h-12! gap-2 px-3! [&_h2]:text-sm', className)}
    {...props}
  >
    <ModulePanelBack />
    {children}
  </Sheet.Header>
);

const ModulePanelTrigger = forwardRef<
  React.ElementRef<typeof Sheet.Trigger>,
  ComponentProps<typeof Sheet.Trigger>
>(({ onClick, ...props }, ref) => {
  const context = useContext(ModulePanelContext);
  return (
    <Sheet.Trigger
      {...props}
      ref={ref}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        context?.onOpen();
      }}
    />
  );
});
ModulePanelTrigger.displayName = 'ModulePanelTrigger';
const ModulePanelContent = ({
  className,
  ...props
}: ComponentProps<typeof Sheet.Content>) => (
  <Sheet.Content
    className={cn('min-h-0 overflow-y-auto rounded-none', className)}
    {...props}
  />
);
const ModulePanelFooter = ({
  className,
  ...props
}: ComponentProps<typeof Sheet.Footer>) => (
  <Sheet.Footer
    className={cn('shrink-0 border-t bg-background px-3', className)}
    {...props}
  />
);

export const CoreModulePanel = Object.assign(ModulePanelRoot, {
  Trigger: ModulePanelTrigger,
  View: ModulePanelView,
  Header: ModulePanelHeader,
  Content: ModulePanelContent,
  Footer: ModulePanelFooter,
  Title: Sheet.Title,
  Description: Sheet.Description,
  Close: Sheet.Close,
});

const FocusPanelRoot = (props: TModulePanelProps) => (
  <ModulePanelRoot {...props} focus />
);
const FocusPanelHeader = ({
  className,
  title,
  description,
  children,
  ...props
}: ComponentProps<typeof FocusSheet.Header>) => (
  <ModulePanelHeader className={className} {...props}>
    <div className="flex min-w-0 flex-col">
      <Sheet.Title>{title}</Sheet.Title>
      <Sheet.Description className={cn(!description && 'sr-only')}>
        {description || title}
      </Sheet.Description>
    </div>
    {children}
    <Sheet.Close />
  </ModulePanelHeader>
);
const FocusPanelContent = ({
  className,
  ...props
}: ComponentProps<typeof FocusSheet.Content>) => (
  <FocusSheet.Content
    className={cn('min-h-0 flex-col!', className)}
    {...props}
  />
);
const FocusPanelSidebar = ({
  children,
}: ComponentProps<typeof FocusSheet.SideBar>) => (
  <div className="shrink-0 border-b [&_[data-sidebar=group-label]]:hidden [&_[data-sidebar=menu]]:flex-row [&_[data-sidebar=menu]]:overflow-x-auto [&_[data-sidebar=group]]:p-1">
    {children}
  </div>
);
export const CoreFocusPanel = Object.assign(FocusPanelRoot, {
  ...FocusSheet,
  Trigger: ModulePanelTrigger,
  View: ModulePanelView,
  Header: FocusPanelHeader,
  Content: FocusPanelContent,
  SideBar: FocusPanelSidebar,
});
