import { NavigationPalette } from '@/navigation/components/NavigationPalette';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePluginsModules } from '@/navigation/hooks/usePluginsModules';
import { useVisitedPageTabs } from '@/navigation/hooks/useVisitedPageTabs';
import { pageLoadingPathnamesState } from '@/navigation/states/pageLoadingState';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import {
  getVisitedPageTabLabel,
  getVisitedPageTabTitle,
  normalizeVisitedPagePathname,
} from '@/navigation/utils/visitedPageTabs';
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
  IconPlus,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { Button, cn, Sidebar, Spinner, Tabs } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import type { ElementType } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from 'react-router-dom';

const SortableVisitedPageTab = ({
  canClose,
  closeLabel,
  icon: Icon,
  index,
  isActive,
  isLoading,
  label,
  onClose,
  pathname,
}: {
  canClose: boolean;
  closeLabel: string;
  icon: ElementType;
  index: number;
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
      {isActive && index < 9 && (
        <span className="mr-1 rounded border bg-muted px-1 py-0.5 font-mono text-[9px] font-semibold leading-none text-accent-foreground">
          ⌘{index + 1}
        </span>
      )}
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

export const VisitedPageTabs = () => {
  const { i18n, t } = useTranslation('common');
  const activities = useNavigationActivities();
  const modules = usePluginsModules();
  const navigation = useNavigation();
  const pageLoadingPathnames = useAtomValue(pageLoadingPathnamesState);
  const {
    activePathname,
    closeVisitedPageTab,
    openVisitedPageTab,
    reorderVisitedPageTab,
    tabs,
  } = useVisitedPageTabs();
  const { toggleSidebar } = Sidebar.useSidebar();
  const [paletteOpen, setPaletteOpen] = useState(false);
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
  const routerLoadingPathname =
    navigation.state !== 'idle'
      ? tabs.some((tab) => tab.pathname === pendingPathname)
        ? pendingPathname
        : activePathname
      : null;

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
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if (
        event.altKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        event.code === 'KeyW'
      ) {
        event.preventDefault();

        if (!event.repeat && tabs.length > 1) {
          closeVisitedPageTab(activePathname);
        }

        return;
      }

      if (!event.metaKey && !event.ctrlKey) {
        return;
      }

      if (event.key === '\\') {
        event.preventDefault();
        toggleSidebar();
        return;
      }

      if (event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
        return;
      }

      const tabIndex = Number(event.key) - 1;
      const tab = tabs[tabIndex];

      if (tabIndex >= 0 && tabIndex < 9 && tab) {
        event.preventDefault();
        openVisitedPageTab(tab.pathname);
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);

    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, [
    activePathname,
    closeVisitedPageTab,
    openVisitedPageTab,
    tabs,
    toggleSidebar,
  ]);

  return (
    <>
      <nav
        aria-label={t('navigation.visited-pages')}
        className="fixed inset-x-0 top-0 z-40 flex h-12 items-center gap-1.5 border-b bg-muted pr-2"
      >
        <div className="flex h-full w-14 shrink-0 items-center justify-center border-r">
          <Sidebar.Trigger
            className="size-10 shrink-0 rounded-md text-accent-foreground [&>svg]:size-5!"
            title={t('navigation.toggle-panel')}
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
              className="min-w-0 shrink overflow-hidden"
            >
              <Tabs.List
                variant="segment"
                className="hide-scroll flex h-10 w-max max-w-full items-center justify-start gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-none bg-transparent p-0"
              >
                <SortableContext
                  items={tabs.map((tab) => tab.pathname)}
                  strategy={horizontalListSortingStrategy}
                >
                  {tabs.map((tab, index) => {
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
                        index={index}
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
            </Tabs>
          </DndContext>
          <Button
            aria-label={t('navigation.open-plugin')}
            className="ml-1 size-7 shrink-0 rounded text-accent-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setPaletteOpen(true)}
            size="icon"
            title={t('navigation.open-plugin')}
            variant="ghost"
          >
            <IconPlus className="size-4" />
          </Button>
        </div>
        <Button
          className="h-7 shrink-0 gap-1.5 px-2 text-xs text-accent-foreground"
          onClick={() => setPaletteOpen(true)}
          title={t('navigation.search')}
          variant="ghost"
        >
          <IconSearch className="size-3.5" />
          <span className="hidden sm:inline">{t('navigation.search')}</span>
          <span className="hidden rounded bg-background px-1 py-0.5 font-mono text-[9px] font-semibold lg:inline">
            ⌘K
          </span>
        </Button>
      </nav>
      <NavigationPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
};
