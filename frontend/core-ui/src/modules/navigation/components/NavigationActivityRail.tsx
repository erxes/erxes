import { NavigationActivityMore } from '@/navigation/components/NavigationActivityMore';
import { NavigationCorePanelContent } from '@/navigation/components/NavigationCoreModules';
import { NavigationPluginPanelContent } from '@/navigation/components/NavigationPlugins';
import { NavigationRailLogo } from '@/navigation/components/NavigationRailLogo';
import { NavigationSidebarFooter } from '@/navigation/components/NavigationSidebarFooter';
import { SidebarNavigationFavorites } from '@/navigation/components/SidebarNavigationFavorites';
import { NotificationCount } from '@/notification/components/MyInboxNavigationItem';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IconApps, IconInbox, IconSearch } from '@tabler/icons-react';
import {
  Button,
  cn,
  HoverCard,
  ScrollArea,
  Separator,
  Sidebar,
} from 'erxes-ui';
import type { ReactNode } from 'react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const HOVER_PREVIEW_HANDOFF_DELAY = 60;

// skipcq: JS-D1001 - Covered by repository documentation policy.
const NavigationSectionHeading = ({
  expanded,
  label,
}: {
  expanded: boolean;
  label: string;
}) => (
  <div className="relative h-6 w-full shrink-0">
    <div
      className={cn(
        'absolute inset-0 flex items-center overflow-hidden whitespace-nowrap px-2 font-mono text-[10px] font-semibold uppercase text-accent-foreground transition-opacity duration-100 ease-linear motion-reduce:transition-none',
        expanded
          ? 'delay-100 opacity-100'
          : 'pointer-events-none delay-0 opacity-0',
      )}
    >
      {label}
    </div>
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
);

// skipcq: JS-D1001 - Covered by repository documentation policy.
const NavigationActivityPeek = ({
  activity,
  onPointerEnter,
  onPointerLeave,
}: {
  activity: INavigationActivity;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
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

// skipcq: JS-D1001 - Covered by repository documentation policy.
const NavigationActivityButton = ({
  activity,
  active,
  expanded,
  indicator,
  onSelect,
}: {
  activity: INavigationActivity;
  active: boolean;
  expanded: boolean;
  indicator?: ReactNode;
  onSelect: () => void;
}) => {
  const Icon = activity.icon || IconApps;

  return (
    <Button
      aria-label={activity.label}
      className={cn(
        'relative h-10 shrink-0 rounded-md [&>svg]:size-4!',
        expanded
          ? 'w-full justify-start gap-2 px-3'
          : 'w-10 justify-center px-0',
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
        <span className="min-w-0 truncate text-left text-[13px] font-medium">
          {activity.label}
        </span>
      )}
      {expanded && indicator}
    </Button>
  );
};

// skipcq: JS-D1001 - Covered by repository documentation policy.
const NavigationActivityHover = ({
  activity,
  active,
  expanded,
  open,
  onClose,
  onOpen,
  onSelect,
}: {
  activity: INavigationActivity;
  active: boolean;
  expanded: boolean;
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
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

  // skipcq: JS-D1001 - Covered by repository documentation policy.
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
            onSelect={handleSelect}
          />
        </div>
      </HoverCard.Trigger>
      <NavigationActivityPeek
        activity={activity}
        onPointerEnter={keepOpen}
        onPointerLeave={closeImmediately}
      />
    </HoverCard>
  );
};

// skipcq: JS-D1001 - Covered by repository documentation policy.
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
          'mb-1 h-10 rounded-md [&>svg]:size-4!',
          expanded
            ? 'w-full justify-start gap-2 px-3'
            : 'w-10 justify-center px-0',
        )}
        onClick={onSearch}
        size={expanded ? 'default' : 'icon'}
        title={t('go-to')}
        type="button"
        variant="ghost"
      >
        <IconSearch className="size-4 text-accent-foreground" />
        {expanded && (
          <span className="truncate text-[13px] font-medium">{t('go-to')}</span>
        )}
      </Button>
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden',
          expanded ? 'items-stretch' : 'items-center',
        )}
      >
        <NavigationSectionHeading
          expanded={expanded}
          label={sidebarT('favorites')}
        />
        <NavigationActivityButton
          activity={inboxActivity}
          active={isInboxActive}
          expanded={expanded}
          indicator={<NotificationCount />}
          onSelect={onSelectInbox}
        />
        <SidebarNavigationFavorites expanded={expanded} />
        {visibleActivities[0] && (
          <NavigationSectionHeading
            expanded={expanded}
            label={t(
              visibleActivities[0].kind === 'plugin'
                ? 'plugins'
                : 'core-modules',
            )}
          />
        )}
        {visibleActivities.map((activity, index) => {
          const active = !isSettings && activity.id === activeActivityId;
          const startsCoreSection =
            activity.kind === 'core' &&
            visibleActivities[index - 1]?.kind === 'plugin';

          return (
            <Fragment key={activity.id}>
              {startsCoreSection && (
                <NavigationSectionHeading
                  expanded={expanded}
                  label={t('core-modules')}
                />
              )}
              {!hoverEnabled ? (
                <NavigationActivityButton
                  activity={activity}
                  active={active}
                  expanded={expanded}
                  onSelect={() => onSelectActivity(activity)}
                />
              ) : (
                <NavigationActivityHover
                  activity={activity}
                  active={active}
                  expanded={expanded}
                  open={previewActivityId === activity.id}
                  onClose={() =>
                    setPreviewActivityId((currentActivityId) =>
                      currentActivityId === activity.id
                        ? null
                        : currentActivityId,
                    )
                  }
                  onOpen={() => setPreviewActivityId(activity.id)}
                  onSelect={() => onSelectActivity(activity)}
                />
              )}
            </Fragment>
          );
        })}
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
