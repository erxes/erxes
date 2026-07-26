import { VisitedPageTabsShortcutGuide } from '@/navigation/components/VisitedPageTabsShortcutGuide';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePluginsModules } from '@/navigation/hooks/usePluginsModules';
import { useVisitedPageTabs } from '@/navigation/hooks/useVisitedPageTabs';
import { pageLoadingPathnamesState } from '@/navigation/states/pageLoadingState';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import {
  getAdjacentVisitedPageTabPathname,
  getVisitedPageTabLabel,
  getVisitedPageTabTitle,
  normalizeVisitedPagePathname,
} from '@/navigation/utils/visitedPageTabs';
import {
  getVisitedPageTabShortcut,
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
import { IconApps, IconFile, IconX } from '@tabler/icons-react';
import { Button, cn, ScrollArea, Sidebar, Spinner, Tabs } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import type { ElementType } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from 'react-router-dom';

// skipcq: JS-D1001 - Covered by repository documentation policy.
const SortableVisitedPageTab = ({
  canClose,
  closeLabel,
  icon: Icon,
  isActive,
  isLoading,
  label,
  onClose,
  pathname,
}: {
  canClose: boolean;
  closeLabel: string;
  icon: ElementType;
  isActive: boolean;
  isLoading: boolean;
  label: string;
  onClose: () => void;
  pathname: string;
}) => {
  const tabRef = useRef<HTMLDivElement | null>(null);
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: pathname });
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

  return (
    <div
      ref={setTabRef}
      className={cn(
        'group/tab flex h-8 min-w-28 max-w-52 shrink-0 items-center rounded-md border border-transparent text-accent-foreground transition-[background-color,border-color,box-shadow,color,opacity] hover:bg-accent/70 hover:text-foreground data-[active=true]:border-border data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm',
        isDragging && 'z-10 opacity-40',
      )}
      aria-busy={isLoading}
      data-active={isActive}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <Tabs.Trigger
        value={pathname}
        title={label}
        className="h-full min-w-0 flex-1 justify-start gap-1.5 rounded-md bg-transparent px-2 text-xs font-medium text-inherit shadow-none hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-inherit data-[state=active]:shadow-none data-[state=active]:hover:bg-transparent"
      >
        {isLoading ? (
          <Spinner
            size="sm"
            className="text-primary"
            containerClassName="size-3.5 shrink-0"
          />
        ) : (
          <Icon
            className={cn(
              'size-3.5 shrink-0 text-muted-foreground',
              isActive && 'text-primary',
            )}
          />
        )}
        <span className="truncate">{label}</span>
      </Tabs.Trigger>
      {canClose && (
        <Button
          aria-label={closeLabel}
          aria-keyshortcuts={isActive ? 'Alt+W' : undefined}
          className="mr-1 size-5 shrink-0 rounded opacity-0 transition-[background-color,opacity] hover:bg-accent group-hover/tab:opacity-100 group-focus-within/tab:opacity-100 data-[active=true]:opacity-100"
          data-active={isActive}
          onClick={onClose}
          onPointerDown={(event) => event.stopPropagation()}
          size="icon"
          title={isActive ? `${closeLabel} (Alt+W)` : closeLabel}
          type="button"
          variant="ghost"
        >
          <IconX className="size-3" />
        </Button>
      )}
    </div>
  );
};

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const VisitedPageTabs = () => {
  const { i18n, t } = useTranslation('common');
  const activities = useNavigationActivities();
  const modules = usePluginsModules();
  const navigation = useNavigation();
  const pageLoadingPathnames = useAtomValue(pageLoadingPathnamesState);
  const {
    activePathname,
    closeAllVisitedPageTabs,
    closeVisitedPageTab,
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
  const pendingPathname = navigation.location?.pathname
    ? normalizeVisitedPagePathname(navigation.location.pathname)
    : activePathname;
  let routerLoadingPathname: string | null = null;

  if (navigation.state !== 'idle') {
    const pendingTabIsOpen = tabs.some(
      (tab) => tab.pathname === pendingPathname,
    );
    routerLoadingPathname = pendingTabIsOpen ? pendingPathname : activePathname;
  }

  // skipcq: JS-D1001 - Covered by repository documentation policy.
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

  const handleCloseActiveTabShortcut = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();

      if (!event.repeat && tabs.length > 1) {
        closeVisitedPageTab(activePathname);
      }
    },
    [activePathname, closeVisitedPageTab, tabs.length],
  );

  useEffect(() => {
    // skipcq: JS-D1001 - Covered by repository documentation policy.
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if (isVisitedPageTabShortcutTargetEditable(event.target)) {
        return;
      }

      const tabShortcut = getVisitedPageTabShortcut(event);

      if (tabShortcut) {
        event.preventDefault();

        if (event.repeat) {
          return;
        }

        if (tabShortcut === 'close-all') {
          closeAllVisitedPageTabs();
          return;
        }

        const destinationPathname = getAdjacentVisitedPageTabPathname(
          tabs,
          activePathname,
          tabShortcut,
        );

        if (destinationPathname) {
          openVisitedPageTab(destinationPathname);
        }

        return;
      }

      if (
        event.altKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        event.code === 'KeyW'
      ) {
        handleCloseActiveTabShortcut(event);
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
    activePathname,
    closeAllVisitedPageTabs,
    handleCloseActiveTabShortcut,
    openVisitedPageTab,
    tabs,
    toggleSidebar,
  ]);

  // skipcq: JS-0415 - The nesting follows the DnD, tabs, and scroll primitives.
  return (
    <nav
      aria-label={t('navigation.visited-pages')}
      className="fixed inset-x-0 top-0 z-40 flex h-12 items-center gap-1.5 border-b bg-muted pr-2"
    >
      <div className="flex h-full w-14 shrink-0 items-center justify-center border-r">
        <Sidebar.Trigger
          aria-label={t('navigation.toggle-panel')}
          className="size-10 shrink-0 rounded-md text-accent-foreground [&>svg]:size-5!"
        />
      </div>
      <div className="flex min-w-0 flex-1 items-center overflow-hidden">
        <DndContext
          autoScroll={false}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <Tabs
            value={activePathname}
            onValueChange={openVisitedPageTab}
            className="min-w-0 flex-1 overflow-hidden"
          >
            <ScrollArea.Root
              className="group/tabs-scroll h-12 w-full"
              type="auto"
            >
              <ScrollArea.Viewport className="h-12 w-full">
                <Tabs.List
                  variant="segment"
                  className="flex h-12 w-max min-w-full items-center justify-start gap-1 rounded-none bg-transparent px-0 pt-0 pb-1"
                >
                  <SortableContext
                    items={tabs.map((tab) => tab.pathname)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {tabs.map((tab) => {
                      const pageLabel = getVisitedPageTabLabel(
                        tab.pathname,
                        modules,
                        labels,
                      );
                      const activity = findNavigationActivityByPath(
                        activities,
                        tab.pathname,
                      );
                      const Icon = activity
                        ? activity.icon || IconApps
                        : IconFile;
                      const translatedPageLabel =
                        activity?.kind === 'plugin'
                          ? i18n.t(
                              pageLabel.toLowerCase().replace(/\s+/g, '-'),
                              {
                                ns: activity.id,
                                defaultValue: pageLabel,
                              },
                            )
                          : pageLabel;
                      const label = getVisitedPageTabTitle(
                        translatedPageLabel,
                        activity?.kind === 'plugin'
                          ? activity.label
                          : undefined,
                      );
                      const isActive = tab.pathname === activePathname;
                      const closeLabel = t('navigation.close-tab', {
                        page: label,
                      });

                      return (
                        <SortableVisitedPageTab
                          key={tab.pathname}
                          canClose={tabs.length > 1}
                          closeLabel={closeLabel}
                          icon={Icon}
                          isActive={isActive}
                          isLoading={
                            tab.pathname === routerLoadingPathname ||
                            pageLoadingPathnames.has(tab.pathname)
                          }
                          label={label}
                          onClose={() => closeVisitedPageTab(tab.pathname)}
                          pathname={tab.pathname}
                        />
                      );
                    })}
                  </SortableContext>
                </Tabs.List>
              </ScrollArea.Viewport>
              <ScrollArea.Bar
                className="z-10 h-1.5 border-0 bg-transparent p-0 opacity-60 transition-opacity group-hover/tabs-scroll:opacity-100 hover:opacity-100"
                orientation="horizontal"
              />
            </ScrollArea.Root>
          </Tabs>
        </DndContext>
      </div>
      <VisitedPageTabsShortcutGuide />
    </nav>
  );
};
