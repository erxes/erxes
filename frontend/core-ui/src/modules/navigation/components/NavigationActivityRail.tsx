import { NavigationActivityMore } from '@/navigation/components/NavigationActivityMore';
import { NavigationActivityPinButton } from '@/navigation/components/NavigationActivityPinButton';
import { NavigationCorePanelContent } from '@/navigation/components/NavigationCoreModules';
import { NavigationPluginPanelContent } from '@/navigation/components/NavigationPlugins';
import { NavigationRailLabel } from '@/navigation/components/NavigationRailLabel';
import { NavigationRailLogo } from '@/navigation/components/NavigationRailLogo';
import { NavigationSidebarFooter } from '@/navigation/components/NavigationSidebarFooter';
import { SidebarNavigationFavorites } from '@/navigation/components/SidebarNavigationFavorites';
import { usePluginsNavigationGroups } from '@/navigation/hooks/usePluginsNavigationGroups';
import { NotificationCount } from '@/notification/components/MyInboxNavigationItem';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import {
  IconApps,
  IconCaretRightFilled,
  IconInbox,
  IconSearch,
} from '@tabler/icons-react';
import {
  Button,
  cn,
  Collapsible,
  HoverCard,
  ScrollArea,
  Separator,
  Sidebar,
} from 'erxes-ui';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const HOVER_PREVIEW_HANDOFF_DELAY = 60;
const SCROLLBAR_HIDE_DELAY = 600;

const NavigationActivitySection = ({
  active,
  children,
  expanded,
  label,
  routeKey,
}: {
  active?: boolean;
  children: ReactNode;
  expanded: boolean;
  label: string;
  routeKey?: string;
}) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (active) {
      setOpen(true);
    }
  }, [active, routeKey]);

  return (
    <section className="w-full shrink-0">
      <Collapsible
        className="group/navigation-section"
        open={!expanded || open}
        onOpenChange={setOpen}
      >
        <div className="relative h-6 w-full shrink-0">
          <Collapsible.Trigger
            className={cn(
              'absolute inset-0 flex w-full items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-md px-2 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-accent-foreground transition-opacity duration-100 ease-linear hover:bg-accent motion-reduce:transition-none',
              expanded
                ? 'delay-100 opacity-100'
                : 'pointer-events-none delay-0 opacity-0',
            )}
            disabled={!expanded}
            tabIndex={expanded ? 0 : -1}
          >
            <IconCaretRightFilled className="size-3 shrink-0 transition-transform duration-150 ease-out group-data-[state=open]/navigation-section:rotate-90 motion-reduce:transition-none" />
            <span className="truncate">{label}</span>
          </Collapsible.Trigger>
          <div
            aria-hidden
            className={cn(
              'absolute inset-y-0 left-0 flex w-full items-center justify-center transition-[opacity,transform] duration-100 ease-linear motion-reduce:transition-none',
              expanded
                ? 'pointer-events-none delay-0 scale-x-75 opacity-0'
                : 'delay-100 scale-x-100 opacity-100',
            )}
          >
            <Separator className="w-8" />
          </div>
        </div>
        <Collapsible.Content className="flex flex-col gap-0.5">
          {children}
        </Collapsible.Content>
      </Collapsible>
    </section>
  );
};

const NavigationActivityContent = ({
  activity,
}: {
  activity: INavigationActivity;
}) =>
  activity.kind === 'plugin' ? (
    <NavigationPluginPanelContent activityId={activity.id} />
  ) : (
    <NavigationCorePanelContent activity={activity} />
  );

const NavigationActivityPeek = ({
  activity,
  pinned,
  onPointerEnter,
  onPointerLeave,
  onPinnedChange,
}: {
  activity: INavigationActivity;
  pinned: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onPinnedChange: (pinned: boolean) => void;
}) => {
  return (
    <HoverCard.Content
      align="start"
      className="flex max-h-[calc(100svh-4rem)] w-60 flex-col overflow-hidden p-0 data-[state=closed]:animate-none"
      side="right"
      sideOffset={2}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="flex h-10 shrink-0 items-center border-b px-3">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {activity.label}
        </span>
        <NavigationActivityPinButton
          activity={activity}
          pinned={pinned}
          onPinnedChange={onPinnedChange}
        />
      </div>
      <ScrollArea className="activity-navigation-tree min-h-0 flex-1 py-1">
        <NavigationActivityContent activity={activity} />
      </ScrollArea>
    </HoverCard.Content>
  );
};

const NavigationActivityButton = ({
  activity,
  active,
  childrenOpen,
  expanded,
  indicator,
  pinned,
  onChildrenOpenChange,
  onPinnedChange,
  onSelect,
}: {
  activity: INavigationActivity;
  active: boolean;
  childrenOpen?: boolean;
  expanded: boolean;
  indicator?: ReactNode;
  pinned?: boolean;
  onChildrenOpenChange?: (open: boolean) => void;
  onPinnedChange?: (pinned: boolean) => void;
  onSelect: () => void;
}) => {
  const Icon = activity.icon || IconApps;
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <div className="group/activity relative flex h-7 w-full min-w-0 shrink-0">
      <Button
        aria-label={activity.label}
        className={cn(
          'relative h-7 min-w-0 shrink-0 justify-start gap-2 rounded-md text-sm transition-[width,margin,padding] duration-200 ease-linear [&>svg]:size-4!',
          expanded ? 'w-full px-2' : 'ml-0.5 w-7 px-1.5',
          expanded &&
            Boolean(onPinnedChange) !== Boolean(onChildrenOpenChange) &&
            'pr-8',
          expanded && onPinnedChange && onChildrenOpenChange && 'pr-14',
          active && !onChildrenOpenChange &&
            'bg-primary/10 text-primary hover:bg-primary/10',
          active && onChildrenOpenChange && 'text-primary',
        )}
        onClick={onSelect}
        size="default"
        type="button"
        variant="ghost"
      >
        {active && !onChildrenOpenChange && (
          <span className="absolute -left-1 top-2 bottom-2 w-0.5 rounded-full bg-primary" />
        )}
        <Icon
          className={cn(
            'size-4 text-accent-foreground',
            active && 'text-primary',
          )}
        />
        <NavigationRailLabel
          className="truncate text-left font-medium"
          expanded={expanded}
        >
          {activity.label}
        </NavigationRailLabel>
        {expanded && indicator}
      </Button>
      {expanded && onPinnedChange && pinned !== undefined && (
        <NavigationActivityPinButton
          activity={activity}
          className={cn(
            'absolute top-0 opacity-0 group-focus-within/activity:opacity-100 group-hover/activity:opacity-100',
            onChildrenOpenChange ? 'right-7' : 'right-0',
          )}
          pinned={pinned}
          onPinnedChange={onPinnedChange}
        />
      )}
      {expanded && onChildrenOpenChange && childrenOpen !== undefined && (
        <Button
          aria-expanded={childrenOpen}
          aria-label={`${t('toggle-panel')}: ${activity.label}`}
          className="absolute top-0 right-0 size-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={(event) => {
            event.stopPropagation();
            onChildrenOpenChange(!childrenOpen);
          }}
          size="icon"
          title={`${t('toggle-panel')}: ${activity.label}`}
          type="button"
          variant="ghost"
        >
          <IconCaretRightFilled
            className={cn(
              'size-3 transition-transform motion-reduce:transition-none',
              'duration-150 ease-out',
              childrenOpen && 'rotate-90',
            )}
          />
        </Button>
      )}
    </div>
  );
};

const NavigationActivityHover = ({
  activity,
  active,
  expanded,
  open,
  pinned,
  onClose,
  onOpen,
  onPinnedChange,
  onSelect,
}: {
  activity: INavigationActivity;
  active: boolean;
  expanded: boolean;
  open: boolean;
  pinned: boolean;
  onClose: () => void;
  onOpen: () => void;
  onPinnedChange: (pinned: boolean) => void;
  onSelect: () => void;
}) => {
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  }, []);

  const keepOpen = useCallback(() => {
    clearCloseTimeout();
    onOpen();
  }, [clearCloseTimeout, onOpen]);

  const scheduleClose = useCallback(() => {
    clearCloseTimeout();
    closeTimeout.current = setTimeout(() => {
      onClose();
      closeTimeout.current = null;
    }, HOVER_PREVIEW_HANDOFF_DELAY);
  }, [clearCloseTimeout, onClose]);

  const closeImmediately = useCallback(() => {
    clearCloseTimeout();
    onClose();
  }, [clearCloseTimeout, onClose]);

  useEffect(() => clearCloseTimeout, [clearCloseTimeout]);

  const handleSelect = () => {
    clearCloseTimeout();
    onClose();
    onSelect();
  };

  return (
    <HoverCard
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          keepOpen();
        }
      }}
      openDelay={0}
      closeDelay={0}
    >
      <HoverCard.Trigger asChild>
        <div
          className="flex w-full shrink-0"
          onBlur={scheduleClose}
          onFocus={keepOpen}
          onPointerEnter={keepOpen}
          onPointerLeave={scheduleClose}
        >
          <NavigationActivityButton
            activity={activity}
            active={active}
            expanded={expanded}
            pinned={pinned}
            onPinnedChange={onPinnedChange}
            onSelect={handleSelect}
          />
        </div>
      </HoverCard.Trigger>
      <NavigationActivityPeek
        activity={activity}
        pinned={pinned}
        onPointerEnter={keepOpen}
        onPointerLeave={closeImmediately}
        onPinnedChange={onPinnedChange}
      />
    </HoverCard>
  );
};

export const NavigationActivityRail = ({
  activities,
  activeActivityId,
  isInboxActive,
  isActivityPinned,
  isSettings,
  mobileExpanded,
  onActivityPinnedChange,
  onSearch,
  onSelectInbox,
  onSelectActivity,
  visibleActivities,
}: {
  activities: INavigationActivity[];
  activeActivityId: string | null;
  isInboxActive: boolean;
  isActivityPinned: (activityId: string) => boolean;
  isSettings: boolean;
  mobileExpanded: boolean;
  onActivityPinnedChange: (activityId: string, pinned: boolean) => void;
  onSearch: () => void;
  onSelectInbox: () => void;
  onSelectActivity: (activity: INavigationActivity) => void;
  visibleActivities: INavigationActivity[];
}) => {
  const { isMobile, state } = Sidebar.useSidebar();
  const navigationGroups = usePluginsNavigationGroups();
  const { pathname } = useLocation();
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { t: sidebarT } = useTranslation('common', {
    keyPrefix: 'sidebar',
  });
  const expanded = isMobile ? mobileExpanded : state === 'expanded';
  const hoverEnabled = !expanded && !isMobile;
  const [previewActivityId, setPreviewActivityId] = useState<string | null>(
    null,
  );
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(
    activeActivityId,
  );
  const [isRailScrolling, setIsRailScrolling] = useState(false);
  const scrollIdleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pluginActivities = visibleActivities.filter(
    (activity) => activity.kind === 'plugin',
  );
  const coreActivities = visibleActivities.filter(
    (activity) => activity.kind === 'core',
  );

  useEffect(() => {
    if (!hoverEnabled) {
      setPreviewActivityId(null);
    }
  }, [hoverEnabled]);

  useEffect(() => {
    if (!expanded || isSettings) {
      setExpandedActivityId(null);
      return;
    }

    setExpandedActivityId(activeActivityId);
  }, [activeActivityId, expanded, isSettings, pathname]);

  const handleRailScroll = useCallback(() => {
    setIsRailScrolling(true);

    if (scrollIdleTimeout.current) {
      clearTimeout(scrollIdleTimeout.current);
    }

    scrollIdleTimeout.current = setTimeout(() => {
      setIsRailScrolling(false);
      scrollIdleTimeout.current = null;
    }, SCROLLBAR_HIDE_DELAY);
  }, []);

  useEffect(
    () => () => {
      if (scrollIdleTimeout.current) {
        clearTimeout(scrollIdleTimeout.current);
      }
    },
    [],
  );

  const inboxActivity: INavigationActivity = {
    id: 'navigation:inbox',
    label: sidebarT('my-inbox'),
    icon: IconInbox,
    kind: 'core',
    modules: [],
    defaultPath: 'my-inbox',
  };

  const renderActivity = (activity: INavigationActivity) => {
    const active = !isSettings && activity.id === activeActivityId;
    const hasChildren =
      activity.kind === 'plugin'
        ? Boolean(
            navigationGroups[activity.id]?.contents.length ||
              navigationGroups[activity.id]?.subGroups.length,
          )
        : activity.modules.some((module) => module.submenus?.length);

    if (!hoverEnabled) {
      if (hasChildren) {
        const childrenOpen =
          expanded && expandedActivityId === activity.id && !isSettings;

        return (
          <Collapsible
            className="w-full shrink-0"
            key={activity.id}
            open={childrenOpen}
            onOpenChange={(open) =>
              setExpandedActivityId(open ? activity.id : null)
            }
          >
            <NavigationActivityButton
              activity={activity}
              active={active}
              childrenOpen={childrenOpen}
              expanded={expanded}
              pinned={isActivityPinned(activity.id)}
              onChildrenOpenChange={(open) =>
                setExpandedActivityId(open ? activity.id : null)
              }
              onPinnedChange={(pinned) =>
                onActivityPinnedChange(activity.id, pinned)
              }
              onSelect={() => {
                setExpandedActivityId(activity.id);
                onSelectActivity(activity);
              }}
            />
            <Collapsible.Content className="activity-dropdown-content min-w-0 overflow-hidden">
              <div className="activity-navigation-tree ml-3.5 min-w-0 border-l border-border/70 py-0.5 pl-1 [&_[data-sidebar=group]]:!px-1 [&_[data-sidebar=group]]:!py-1 [&_[data-sidebar=group-content]]:!pt-0.5 [&_[data-sidebar=menu]]:!gap-0.5 [&_[data-sidebar=separator]]:hidden">
                <NavigationActivityContent activity={activity} />
              </div>
            </Collapsible.Content>
          </Collapsible>
        );
      }

      return (
        <NavigationActivityButton
          key={activity.id}
          activity={activity}
          active={active}
          expanded={expanded}
          pinned={isActivityPinned(activity.id)}
          onPinnedChange={(pinned) =>
            onActivityPinnedChange(activity.id, pinned)
          }
          onSelect={() => onSelectActivity(activity)}
        />
      );
    }

    return (
      <NavigationActivityHover
        key={activity.id}
        activity={activity}
        active={active}
        expanded={expanded}
        open={previewActivityId === activity.id}
        pinned={isActivityPinned(activity.id)}
        onClose={() =>
          setPreviewActivityId((currentActivityId) =>
            currentActivityId === activity.id ? null : currentActivityId,
          )
        }
        onOpen={() => setPreviewActivityId(activity.id)}
        onPinnedChange={(pinned) => onActivityPinnedChange(activity.id, pinned)}
        onSelect={() => onSelectActivity(activity)}
      />
    );
  };

  return (
    <aside
      className={cn(
        'flex w-full shrink-0 flex-col border-none bg-sidebar px-2 py-2',
        !expanded && 'border-r!',
        isMobile && !expanded && 'w-12',
      )}
    >
      <NavigationRailLogo expanded={expanded} />
      <Button
        aria-label={t('go-to')}
        aria-keyshortcuts="Control+M Meta+M"
        className={cn(
          'mb-1 h-7 shrink-0 justify-start gap-2 rounded-md text-sm transition-[width,margin,padding] duration-200 ease-linear [&>svg]:size-4!',
          expanded ? 'w-full px-2' : 'ml-0.5 w-7 px-1.5',
        )}
        onClick={onSearch}
        size="default"
        title={t('go-to')}
        type="button"
        variant="ghost"
      >
        <IconSearch className="size-4 text-accent-foreground" />
        <NavigationRailLabel
          className="truncate font-medium"
          expanded={expanded}
        >
          {t('go-to')}
        </NavigationRailLabel>
      </Button>
      <div
        data-scrolling={isRailScrolling}
        className="auto-hide-scroll flex min-h-0 flex-1 flex-col items-stretch gap-0.5 overflow-x-hidden overflow-y-auto"
        onScroll={handleRailScroll}
      >
        <NavigationActivitySection
          expanded={expanded}
          label={sidebarT('favorites')}
        >
          <NavigationActivityButton
            activity={inboxActivity}
            active={isInboxActive}
            expanded={expanded}
            indicator={<NotificationCount />}
            onSelect={onSelectInbox}
          />
          <SidebarNavigationFavorites expanded={expanded} />
        </NavigationActivitySection>
        {pluginActivities.length > 0 && (
          <NavigationActivitySection
            active={
              !isSettings &&
              pluginActivities.some(
                (activity) => activity.id === activeActivityId,
              )
            }
            expanded={expanded}
            label={t('plugins')}
            routeKey={pathname}
          >
            {pluginActivities.map(renderActivity)}
          </NavigationActivitySection>
        )}
        {coreActivities.length > 0 && (
          <NavigationActivitySection
            active={
              !isSettings &&
              coreActivities.some(
                (activity) => activity.id === activeActivityId,
              )
            }
            expanded={expanded}
            label={t('core-modules')}
            routeKey={pathname}
          >
            {coreActivities.map(renderActivity)}
          </NavigationActivitySection>
        )}
        <NavigationActivityMore
          activities={activities}
          expanded={expanded}
          isActivityPinned={isActivityPinned}
          onPinnedChange={onActivityPinnedChange}
          onSelect={onSelectActivity}
        />
      </div>
      <NavigationSidebarFooter expanded={expanded} isSettings={isSettings} />
    </aside>
  );
};
