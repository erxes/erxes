import { VisitedPageTabsShortcutGuide } from '@/navigation/components/VisitedPageTabsShortcutGuide';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePluginsModules } from '@/navigation/hooks/usePluginsModules';
import { useVisitedPageTabs } from '@/navigation/hooks/useVisitedPageTabs';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import {
  getAdjacentVisitedPageTabPathname,
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
import { IconApps, IconFile, IconX } from '@tabler/icons-react';
import { Button, cn, ScrollArea, Sidebar, Tabs } from 'erxes-ui';
import type { ElementType } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const SortableVisitedPageTab = ({
  canClose,
  closeAriaShortcut,
  closeLabel,
  closeShortcutLabel,
  icon: Icon,
  isActive,
  label,
  onClose,
  pathname,
}: {
  canClose: boolean;
  closeAriaShortcut: string;
  closeLabel: string;
  closeShortcutLabel: string;
  icon: ElementType;
  isActive: boolean;
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
      <Tabs.Trigger
        value={pathname}
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
      {canClose && (
        <Button
          aria-label={closeLabel}
          aria-keyshortcuts={isActive ? closeAriaShortcut : undefined}
          className="mr-0.5 size-4 shrink-0 rounded opacity-0 transition-[background-color,opacity] hover:bg-accent group-hover/tab:opacity-100 group-focus-within/tab:opacity-100 data-[active=true]:opacity-100"
          data-active={isActive}
          onClick={onClose}
          onPointerDown={(event) => event.stopPropagation()}
          size="icon"
          title={
            isActive ? `${closeLabel} (${closeShortcutLabel})` : closeLabel
          }
          type="button"
          variant="ghost"
        >
          <IconX className="size-2.5" />
        </Button>
      )}
    </div>
  );
};

export const VisitedPageTabs = () => {
  const { i18n, t } = useTranslation('common');
  const activities = useNavigationActivities();
  const modules = usePluginsModules();
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
  const isMac = isMacPlatform();
  const closeAriaShortcut = isMac ? 'Meta+Alt+W' : 'Control+Alt+W';
  const closeShortcutLabel = isMac ? '⌘ ⌥ W' : 'Ctrl Alt W';

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

      if (tabShortcut === 'close-all') {
        closeAllVisitedPageTabs();
        return;
      }

      if (tabShortcut === 'close-current') {
        if (tabs.length > 1) {
          closeVisitedPageTab(activePathname);
        }

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
    activePathname,
    closeAllVisitedPageTabs,
    closeVisitedPageTab,
    openVisitedPageTab,
    tabs,
    toggleSidebar,
  ]);

  return (
    /* skipcq: JS-0415 - The nesting follows the DnD, tabs, and scroll primitives. */
    <nav
      aria-label={t('navigation.visited-pages')}
      className="fixed inset-x-0 top-0 z-40 flex h-10 items-center gap-1.5 border-b bg-muted px-2"
    >
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
              className="group/tabs-scroll h-10 w-full"
              type="auto"
            >
              <ScrollArea.Viewport className="h-10 w-full">
                <Tabs.List
                  variant="segment"
                  className="flex h-10 w-max min-w-full items-center justify-start gap-1 rounded-none bg-transparent px-0 group-has-data-[state=visible]/tabs-scroll:pb-1"
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
                          closeAriaShortcut={closeAriaShortcut}
                          closeLabel={closeLabel}
                          closeShortcutLabel={closeShortcutLabel}
                          icon={Icon}
                          isActive={isActive}
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
