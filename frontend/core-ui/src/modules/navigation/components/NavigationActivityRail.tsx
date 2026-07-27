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
        'relative h-10 rounded-md [&>svg]:size-4!',
        expanded
          ? 'w-full justify-start gap-2 px-2'
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
          className="flex"
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
            ? 'w-full justify-start gap-2 px-2'
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
        {expanded && (
          <Sidebar.GroupLabel className="h-6 px-2 text-[10px]">
            {sidebarT('favorites')}
          </Sidebar.GroupLabel>
        )}
        <NavigationActivityButton
          activity={inboxActivity}
          active={isInboxActive}
          expanded={expanded}
          indicator={<NotificationCount />}
          onSelect={onSelectInbox}
        />
        <SidebarNavigationFavorites expanded={expanded} />
        {!expanded && <Separator className="my-1 w-8" />}
        {expanded && visibleActivities[0] && (
          <Sidebar.GroupLabel className="h-6 px-2 text-[10px]">
            {t(
              visibleActivities[0].kind === 'plugin'
                ? 'plugins'
                : 'core-modules',
            )}
          </Sidebar.GroupLabel>
        )}
        {visibleActivities.map((activity, index) => {
          const active = !isSettings && activity.id === activeActivityId;
          const startsCoreSection =
            activity.kind === 'core' &&
            visibleActivities[index - 1]?.kind === 'plugin';

          return (
            <Fragment key={activity.id}>
              {startsCoreSection &&
                (expanded ? (
                  <Sidebar.GroupLabel className="h-6 px-2 text-[10px]">
                    {t('core-modules')}
                  </Sidebar.GroupLabel>
                ) : (
                  <Separator className="my-1 w-8" />
                ))}
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
