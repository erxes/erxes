import { GlobalSearchTrigger } from '@/search/components/GlobalSearchTrigger';
import { VisitedPageTabsShortcutGuide } from '@/navigation/components/VisitedPageTabsShortcutGuide';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePluginsModules } from '@/navigation/hooks/usePluginsModules';
import { useVisitedPageTabs } from '@/navigation/hooks/useVisitedPageTabs';
import { visitedPageTabsVisibleState } from '@/navigation/states/visitedPageTabsState';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import {
  getAdjacentVisitedPageTabId,
  getVisitedPageTabLabel,
  getVisitedPageTabTitle,
} from '@/navigation/utils/visitedPageTabs';
import {
  getVisitedPageTabShortcut,
  isMacPlatform,
  isVisitedPageTabShortcutTargetEditable,
} from '@/navigation/utils/visitedPageTabShortcuts';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import {
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconApps,
  IconFile,
  IconLayoutNavbarCollapse,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import {
  Button,
  cn,
  ContextMenu,
  ScrollArea,
  Sidebar,
  Tabs,
  Tooltip,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import type { ComponentProps, ElementType, ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const SortableVisitedPageTab = ({
  canClose,
  closeAriaShortcut,
  closeLabel,
  closeAllLabel,
  closeShortcutLabel,
  hideTabsLabel,
  icon: Icon,
  isActive,
  label,
  onClose,
  onCloseAll,
  onHideTabs,
  tabId,
}: Readonly<{
  canClose: boolean;
  closeAriaShortcut: string;
  closeLabel: string;
  closeAllLabel: string;
  closeShortcutLabel: string;
  hideTabsLabel: string;
  icon: ElementType;
  isActive: boolean;
  label: string;
  onClose: () => void;
  onCloseAll: () => void;
  onHideTabs: () => void;
  tabId: string;
}>) => {
  const tabRef = useRef<HTMLDivElement | null>(null);
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: tabId });
  const setTabRef = useCallback(
    (node: HTMLDivElement | null) => {
      tabRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  useEffect(() => {
    if (!isActive) {
      return;
    }

    tabRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    });
  }, [isActive]);

  const tabTrigger = (
    <Tabs.Trigger
      value={tabId}
      title={label}
      className="h-full min-w-0 flex-1 justify-start gap-1 rounded-md bg-transparent px-1.5 text-[11px] font-medium text-inherit shadow-none hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-inherit data-[state=active]:shadow-none data-[state=active]:hover:bg-transparent"
    >
      <Icon
        className={cn(
          'size-3 shrink-0 text-muted-foreground',
          isActive && 'text-primary',
        )}
      />
      <span className="truncate">{label}</span>
    </Tabs.Trigger>
  );
  const closeButton = canClose ? (
    <Button
      aria-label={closeLabel}
      aria-keyshortcuts={isActive ? closeAriaShortcut : undefined}
      className="mr-0.5 size-4 shrink-0 rounded opacity-0 transition-[background-color,opacity] hover:bg-accent group-hover/tab:opacity-100 group-focus-within/tab:opacity-100 data-[active=true]:opacity-100"
      data-active={isActive}
      onClick={onClose}
      onPointerDown={(event) => event.stopPropagation()}
      size="icon"
      title={isActive ? `${closeLabel} (${closeShortcutLabel})` : closeLabel}
      type="button"
      variant="ghost"
    >
      <IconX className="size-2.5" />
    </Button>
  ) : null;

  return (
    <ContextMenu>
      <ContextMenu.Trigger asChild>
        <div
          ref={setTabRef}
          className={cn(
            'group/tab flex h-6 min-w-20 max-w-40 shrink-0 items-center rounded-md border border-transparent text-accent-foreground transition-[background-color,border-color,box-shadow,color,opacity] hover:bg-accent/70 hover:text-foreground data-[active=true]:border-border data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm',
            isDragging && 'z-10 opacity-40',
          )}
          data-active={isActive}
          style={{
            transform: CSS.Transform.toString(transform),
            transition,
          }}
          {...attributes}
          {...listeners}
        >
          {tabTrigger}
          {closeButton}
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onSelect={onCloseAll}>
          <IconX />
          {closeAllLabel}
        </ContextMenu.Item>
        <ContextMenu.Item onSelect={onHideTabs}>
          <IconLayoutNavbarCollapse />
          {hideTabsLabel}
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
};

const VisitedPageTabsList = ({
  children,
  items,
  trailingAction,
}: Readonly<{
  children: ReactNode;
  items: string[];
  trailingAction: ReactNode;
}>) => (
  <ScrollArea.Root className="group/tabs-scroll h-10 w-full" type="auto">
    <ScrollArea.Viewport className="h-10 w-full">
      <Tabs.List
        variant="segment"
        className="flex h-10 w-max min-w-full items-center justify-start gap-1 rounded-none bg-transparent px-0 group-has-data-[state=visible]/tabs-scroll:pb-1"
      >
        <SortableContext items={items} strategy={horizontalListSortingStrategy}>
          {children}
        </SortableContext>
        {trailingAction}
      </Tabs.List>
    </ScrollArea.Viewport>
    <ScrollArea.Bar
      className="z-10 h-1.5 border-0 bg-transparent p-0 opacity-60 transition-opacity group-hover/tabs-scroll:opacity-100 hover:opacity-100"
      orientation="horizontal"
    />
  </ScrollArea.Root>
);

const VisitedPageTabsContent = ({
  activeTabId,
  children,
  items,
  onDragEnd,
  onValueChange,
  sensors,
  trailingAction,
}: Readonly<{
  activeTabId: string | null;
  children: ReactNode;
  items: string[];
  onDragEnd: (event: DragEndEvent) => void;
  onValueChange: (tabId: string) => void;
  sensors: ComponentProps<typeof DndContext>['sensors'];
  trailingAction: ReactNode;
}>) => (
  <DndContext
    autoScroll={false}
    collisionDetection={closestCenter}
    modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
    onDragEnd={onDragEnd}
    sensors={sensors}
  >
    <Tabs
      value={activeTabId ?? ''}
      onValueChange={onValueChange}
      className="min-w-0 flex-1 overflow-hidden"
    >
      <VisitedPageTabsList items={items} trailingAction={trailingAction}>
        {children}
      </VisitedPageTabsList>
    </Tabs>
  </DndContext>
);

export const VisitedPageTabs = () => {
  const { i18n, t } = useTranslation('common');
  const [tabsVisible, setTabsVisible] = useAtom(visitedPageTabsVisibleState);
  const activities = useNavigationActivities();
  const modules = usePluginsModules() ?? [];
  const {
    activeTabId,
    closeAllVisitedPageTabs,
    closeVisitedPageTab,
    openNewVisitedPageTab,
    openVisitedPageTab,
    reorderVisitedPageTab,
    tabs,
  } = useVisitedPageTabs();
  const { toggleSidebar } = Sidebar.useSidebar();
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const labels = {
    details: t('navigation.details'),
    myInbox: t('my-inbox'),
  };
  const isMac = isMacPlatform();
  const closeAriaShortcut = isMac ? 'Meta+Alt+W' : 'Control+Alt+W';
  const closeShortcutLabel = isMac ? '⌘ ⌥ W' : 'Ctrl Alt W';
  const toggleTabsAriaShortcut = isMac ? 'Meta+Alt+T' : 'Control+Alt+T';
  const toggleTabsShortcutLabel = isMac ? '⌘ ⌥ T' : 'Ctrl Alt T';

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (
      !over ||
      active.id === over.id ||
      typeof active.id !== 'string' ||
      typeof over.id !== 'string'
    ) {
      return;
    }

    reorderVisitedPageTab(active.id, over.id);
  };

  useEffect(() => {
    const handleTabShortcut = (
      event: KeyboardEvent,
      tabShortcut: NonNullable<ReturnType<typeof getVisitedPageTabShortcut>>,
    ) => {
      event.preventDefault();

      if (event.repeat) {
        return;
      }

      if (tabShortcut === 'toggle-visibility') {
        setTabsVisible((visible) => !visible);
        return;
      }

      if (tabShortcut === 'close-all') {
        closeAllVisitedPageTabs();
        return;
      }

      if (tabShortcut === 'close-current') {
        if (tabs.length > 1 && activeTabId) {
          closeVisitedPageTab(activeTabId);
        }

        return;
      }

      const destinationTabId = getAdjacentVisitedPageTabId(
        tabs,
        activeTabId,
        tabShortcut,
      );

      if (destinationTabId) {
        openVisitedPageTab(destinationTabId);
      }
    };

    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if (isVisitedPageTabShortcutTargetEditable(event.target)) {
        return;
      }

      const tabShortcut = getVisitedPageTabShortcut(event);

      if (tabShortcut) {
        handleTabShortcut(event, tabShortcut);
        return;
      }

      if (!event.metaKey && !event.ctrlKey) {
        return;
      }

      if (event.key === '\\') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);

    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, [
    activeTabId,
    closeAllVisitedPageTabs,
    closeVisitedPageTab,
    openVisitedPageTab,
    setTabsVisible,
    tabs,
    toggleSidebar,
  ]);

  if (!tabsVisible) {
    return null;
  }

  const tabIds = tabs.map((tab) => tab.id);
  const tabItems = tabs.map((tab) => {
    const pageLabel = getVisitedPageTabLabel(tab.pathname, modules, labels);
    const activity = findNavigationActivityByPath(activities, tab.pathname);
    const Icon = activity ? activity.icon || IconApps : IconFile;
    const translatedPageLabel =
      activity?.kind === 'plugin'
        ? i18n.t(pageLabel.toLowerCase().replace(/\s+/g, '-'), {
            ns: activity.id,
            defaultValue: pageLabel,
          })
        : pageLabel;
    const label = getVisitedPageTabTitle(
      translatedPageLabel,
      activity?.kind === 'plugin' ? activity.label : undefined,
    );
    const isActive = tab.id === activeTabId;
    const closeLabel = t('navigation.close-tab', {
      page: label,
    });

    return (
      <SortableVisitedPageTab
        key={tab.id}
        canClose={tabs.length > 1}
        closeAriaShortcut={closeAriaShortcut}
        closeAllLabel={t('navigation.close-all-tabs')}
        closeLabel={closeLabel}
        closeShortcutLabel={closeShortcutLabel}
        hideTabsLabel={t('navigation.hide-tabs-row')}
        icon={Icon}
        isActive={isActive}
        label={label}
        onClose={() => closeVisitedPageTab(tab.id)}
        onCloseAll={closeAllVisitedPageTabs}
        onHideTabs={() => setTabsVisible(false)}
        tabId={tab.id}
      />
    );
  });

  return (
    <nav
      aria-label={t('navigation.visited-pages')}
      className="fixed inset-x-0 top-0 z-40 flex h-10 items-center gap-1.5 border-b bg-muted px-2"
    >
      <div className="flex min-w-0 flex-1 items-center overflow-hidden">
        <VisitedPageTabsContent
          activeTabId={activeTabId}
          items={tabIds}
          onDragEnd={handleDragEnd}
          onValueChange={openVisitedPageTab}
          sensors={sensors}
          trailingAction={
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  aria-label={t('navigation.new-tab', {
                    defaultValue: 'New tab',
                  })}
                  className="size-6 shrink-0 rounded-md text-muted-foreground"
                  onClick={openNewVisitedPageTab}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <IconPlus className="size-3.5" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom">
                {t('navigation.new-tab', { defaultValue: 'New tab' })}
              </Tooltip.Content>
            </Tooltip>
          }
        >
          {tabItems}
        </VisitedPageTabsContent>
      </div>
      <GlobalSearchTrigger />
      <Button
        aria-keyshortcuts={toggleTabsAriaShortcut}
        aria-label={t('navigation.hide-tabs-row')}
        className="size-8 shrink-0 text-muted-foreground"
        onClick={() => setTabsVisible(false)}
        size="icon"
        title={`${t('navigation.hide-tabs-row')} (${toggleTabsShortcutLabel})`}
        type="button"
        variant="ghost"
      >
        <IconLayoutNavbarCollapse className="size-4" />
      </Button>
      <VisitedPageTabsShortcutGuide />
    </nav>
  );
};
