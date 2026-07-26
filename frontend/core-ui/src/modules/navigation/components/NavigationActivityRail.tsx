import { NavigationActivityMore } from '@/navigation/components/NavigationActivityMore';
import { NavigationCorePanelContent } from '@/navigation/components/NavigationCoreModules';
import { NavigationPluginPanelContent } from '@/navigation/components/NavigationPlugins';
import { NavigationRailLogo } from '@/navigation/components/NavigationRailLogo';
import { NavigationSidebarFooter } from '@/navigation/components/NavigationSidebarFooter';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IconApps, IconSearch } from '@tabler/icons-react';
import {
  Button,
  cn,
  HoverCard,
  ScrollArea,
  Separator,
  Sidebar,
} from 'erxes-ui';
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
  onSelect,
}: {
  activity: INavigationActivity;
  active: boolean;
  onSelect: () => void;
}) => {
  const Icon = activity.icon || IconApps;

  return (
    <Button
      aria-label={activity.label}
      className={cn(
        'relative size-10 rounded-md text-accent-foreground [&>svg]:size-5!',
        active && 'bg-primary/10 text-primary hover:bg-primary/10',
      )}
      onClick={onSelect}
      size="icon"
      variant="ghost"
    >
      {active && (
        <span className="absolute -left-1 top-2 bottom-2 w-0.5 rounded-full bg-primary" />
      )}
      <Icon className="size-5" />
    </Button>
  );
};

// skipcq: JS-D1001 - Covered by repository documentation policy.
const NavigationActivityHover = ({
  activity,
  active,
  open,
  onClose,
  onOpen,
  onSelect,
}: {
  activity: INavigationActivity;
  active: boolean;
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
  isActivityPinned,
  isSettings,
  onActivityPinnedChange,
  onSearch,
  onSelectActivity,
  visibleActivities,
}: {
  activities: INavigationActivity[];
  activeActivityId: string | null;
  isActivityPinned: (activityId: string) => boolean;
  isSettings: boolean;
  onActivityPinnedChange: (activityId: string, pinned: boolean) => void;
  onSearch: () => void;
  onSelectActivity: (activity: INavigationActivity) => void;
  visibleActivities: INavigationActivity[];
}) => {
  const { isMobile } = Sidebar.useSidebar();
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const hoverEnabled = !isMobile;
  const [previewActivityId, setPreviewActivityId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!hoverEnabled) {
      setPreviewActivityId(null);
    }
  }, [hoverEnabled]);

  return (
    <aside className="flex w-14 shrink-0 flex-col items-center border-r bg-sidebar px-1 py-2">
      <NavigationRailLogo />
      <Button
        aria-label={t('go-to')}
        aria-keyshortcuts="Control+M Meta+M"
        className="mb-1 size-10 rounded-md text-accent-foreground [&>svg]:size-5!"
        onClick={onSearch}
        size="icon"
        title={t('go-to')}
        type="button"
        variant="ghost"
      >
        <IconSearch className="size-5" />
      </Button>
      <div className="flex min-h-0 flex-1 flex-col items-center gap-0.5 overflow-y-auto overflow-x-hidden">
        {visibleActivities.map((activity, index) => {
          const active = !isSettings && activity.id === activeActivityId;
          const startsCoreSection =
            activity.kind === 'core' &&
            visibleActivities[index - 1]?.kind === 'plugin';

          return (
            <Fragment key={activity.id}>
              {startsCoreSection && <Separator className="my-1 w-8" />}
              {!hoverEnabled ? (
                <NavigationActivityButton
                  activity={activity}
                  active={active}
                  onSelect={() => onSelectActivity(activity)}
                />
              ) : (
                <NavigationActivityHover
                  activity={activity}
                  active={active}
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
          isActivityPinned={isActivityPinned}
          onPinnedChange={onActivityPinnedChange}
          onSelect={onSelectActivity}
        />
      </div>
      <NavigationSidebarFooter isSettings={isSettings} />
    </aside>
  );
};
