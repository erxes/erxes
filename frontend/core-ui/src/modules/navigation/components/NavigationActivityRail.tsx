import { NavigationActivityMore } from '@/navigation/components/NavigationActivityMore';
import { NavigationActivityPinButton } from '@/navigation/components/NavigationActivityPinButton';
import { NavigationCorePanelContent } from '@/navigation/components/NavigationCoreModules';
import { NavigationPluginPanelContent } from '@/navigation/components/NavigationPlugins';
import { NavigationRailLogo } from '@/navigation/components/NavigationRailLogo';
import { NavigationSidebarFooter } from '@/navigation/components/NavigationSidebarFooter';
import { SidebarNavigationFavorites } from '@/navigation/components/SidebarNavigationFavorites';
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

const HOVER_PREVIEW_HANDOFF_DELAY = 60;

const NavigationActivitySection = ({
  children,
  expanded,
  label,
}: {
  children: ReactNode;
  expanded: boolean;
  label: string;
}) => {
  const [open, setOpen] = useState(true);

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
              'absolute inset-0 flex w-full items-center gap-2 overflow-hidden whitespace-nowrap rounded-md px-2 text-left font-sans text-xs font-semibold text-accent-foreground transition-opacity duration-100 ease-linear hover:bg-accent motion-reduce:transition-none',
              expanded
                ? 'delay-100 opacity-100'
                : 'pointer-events-none delay-0 opacity-0',
            )}
            disabled={!expanded}
            tabIndex={expanded ? 0 : -1}
          >
            <IconCaretRightFilled className="size-3.5 shrink-0 transition-transform group-data-[state=open]/navigation-section:rotate-90" />
            <span className="truncate">{label}</span>
          </Collapsible.Trigger>
          <div
            aria-hidden
            className={cn(
              'absolute inset-y-0 left-0 flex w-10 items-center justify-center transition-[opacity,transform] duration-100 ease-linear motion-reduce:transition-none',
              expanded
                ? 'pointer-events-none delay-0 scale-x-75 opacity-0'
                : 'delay-100 scale-x-100 opacity-100',
            )}
          >
            <Separator className="w-8" />
          </div>
        </div>
        <Collapsible.Content className="flex flex-col gap-1">
          {children}
        </Collapsible.Content>
      </Collapsible>
    </section>
  );
};

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
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
          {activity.label}
        </span>
        <NavigationActivityPinButton
          activity={activity}
          pinned={pinned}
          onPinnedChange={onPinnedChange}
        />
      </div>
      <ScrollArea className="min-h-0 flex-1 py-1">
        {activity.kind === 'plugin' ? (
          <NavigationPluginPanelContent activityId={activity.id} />
        ) : (
          <NavigationCorePanelContent activity={activity} />
        )}
      </ScrollArea>
    </HoverCard.Content>
  );
};

const NavigationActivityButton = ({
  activity,
  active,
  expanded,
  indicator,
  pinned,
  onPinnedChange,
  onSelect,
}: {
  activity: INavigationActivity;
  active: boolean;
  expanded: boolean;
  indicator?: ReactNode;
  pinned?: boolean;
  onPinnedChange?: (pinned: boolean) => void;
  onSelect: () => void;
}) => {
  const Icon = activity.icon || IconApps;

  return (
    <div
      className={cn(
        'group/activity relative flex min-w-0 shrink-0',
        expanded ? 'h-7 w-full' : 'size-7',
      )}
    >
      <Button
        aria-label={activity.label}
        className={cn(
          'relative shrink-0 rounded-md [&>svg]:size-4!',
          expanded
            ? 'h-7 min-w-0 flex-1 justify-start gap-2 px-2 text-sm'
            : 'size-7 justify-center px-0',
          expanded && onPinnedChange && 'pr-8',
          active && 'bg-primary/10 text-primary hover:bg-primary/10',
        )}
        onClick={onSelect}
        size={expanded ? 'default' : 'icon'}
        variant="ghost"
      >
        {active && (
          <span className="absolute -left-1 top-2 bottom-2 w-0.5 rounded-full bg-primary" />
        )}
        <Icon
          className={cn(
            'size-4 text-accent-foreground',
            active && 'text-primary',
          )}
        />
        {expanded && (
          <span className="min-w-0 truncate text-left font-medium">
            {activity.label}
          </span>
        )}
        {expanded && indicator}
      </Button>
      {expanded && onPinnedChange && pinned !== undefined && (
        <NavigationActivityPinButton
          activity={activity}
          className="absolute top-0 right-0 opacity-0 group-focus-within/activity:opacity-100 group-hover/activity:opacity-100"
          pinned={pinned}
          onPinnedChange={onPinnedChange}
        />
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
          className="flex shrink-0"
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
  onActivityPinnedChange: (activityId: string, pinned: boolean) => void;
  onSearch: () => void;
  onSelectInbox: () => void;
  onSelectActivity: (activity: INavigationActivity) => void;
  visibleActivities: INavigationActivity[];
}) => {
  const { isMobile, state } = Sidebar.useSidebar();
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { t: sidebarT } = useTranslation('common', {
    keyPrefix: 'sidebar',
  });
  const expanded = state === 'expanded' && !isMobile;
  const hoverEnabled = !expanded && !isMobile;
  const [previewActivityId, setPreviewActivityId] = useState<string | null>(
    null,
  );
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

    if (!hoverEnabled) {
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
        'flex shrink-0 flex-col border-r bg-sidebar px-2 py-2',
        expanded ? 'w-full items-stretch' : 'w-14 items-center',
      )}
    >
      <NavigationRailLogo expanded={expanded} />
      <Button
        aria-label={t('go-to')}
        aria-keyshortcuts="Control+M Meta+M"
        className={cn(
          'mb-1 rounded-md [&>svg]:size-4!',
          expanded
            ? 'h-7 w-full justify-start gap-2 px-2 text-sm'
            : 'size-7 justify-center px-0',
        )}
        onClick={onSearch}
        size={expanded ? 'default' : 'icon'}
        title={t('go-to')}
        type="button"
        variant="ghost"
      >
        <IconSearch className="size-4 text-accent-foreground" />
        {expanded && <span className="truncate font-medium">{t('go-to')}</span>}
      </Button>
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden',
          expanded ? 'items-stretch gap-1' : 'items-center gap-1',
        )}
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
          <NavigationActivitySection expanded={expanded} label={t('plugins')}>
            {pluginActivities.map(renderActivity)}
          </NavigationActivitySection>
        )}
        {coreActivities.length > 0 && (
          <NavigationActivitySection
            expanded={expanded}
            label={t('core-modules')}
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
