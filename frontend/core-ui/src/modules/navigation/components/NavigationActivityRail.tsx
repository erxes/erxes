import { NavigationCorePanelContent } from '@/navigation/components/NavigationCoreModules';
import { NavigationPluginPanelContent } from '@/navigation/components/NavigationPlugins';
import { NavigationRailLogo } from '@/navigation/components/NavigationRailLogo';
import { NavigationSidebarFooter } from '@/navigation/components/NavigationSidebarFooter';
import { visitedPageTabsState } from '@/navigation/states/visitedPageTabsState';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { doesNavigationActivityMatchPath } from '@/navigation/utils/navigationActivities';
import { IconApps } from '@tabler/icons-react';
import {
  Button,
  cn,
  HoverCard,
  ScrollArea,
  Separator,
  Sidebar,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const HOVER_PREVIEW_HANDOFF_DELAY = 60;

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
        <span className="truncate text-[13px] font-semibold">
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

const NavigationActivityButton = ({
  activity,
  active,
  openInTabs,
  onSelect,
}: {
  activity: INavigationActivity;
  active: boolean;
  openInTabs: boolean;
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
      title={activity.label}
      variant="ghost"
    >
      {active && (
        <span className="absolute -left-1 top-2 bottom-2 w-0.5 rounded-full bg-primary" />
      )}
      <Icon className="size-5" />
      {openInTabs && !active && (
        <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent-foreground" />
      )}
    </Button>
  );
};

const NavigationActivityHover = ({
  activity,
  active,
  open,
  openInTabs,
  onClose,
  onOpen,
  onSelect,
}: {
  activity: INavigationActivity;
  active: boolean;
  open: boolean;
  openInTabs: boolean;
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
            openInTabs={openInTabs}
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

export const NavigationActivityRail = ({
  activities,
  activeActivityId,
  isSettings,
  onSelectActivity,
}: {
  activities: INavigationActivity[];
  activeActivityId: string | null;
  isSettings: boolean;
  onSelectActivity: (activity: INavigationActivity) => void;
}) => {
  const tabs = useAtomValue(visitedPageTabsState);
  const { isMobile, open } = Sidebar.useSidebar();
  const hoverEnabled = !open && !isMobile;
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
      <div className="flex min-h-0 flex-1 flex-col items-center gap-0.5 overflow-y-auto overflow-x-hidden">
        {activities.map((activity, index) => {
          const active = !isSettings && activity.id === activeActivityId;
          const openInTabs = tabs.some((tab) =>
            doesNavigationActivityMatchPath(activity, tab.pathname),
          );
          const startsCoreSection =
            activity.kind === 'core' &&
            activities[index - 1]?.kind === 'plugin';

          return (
            <Fragment key={activity.id}>
              {startsCoreSection && <Separator className="my-1 w-8" />}
              {!hoverEnabled ? (
              <NavigationActivityButton
                activity={activity}
                active={active}
                openInTabs={openInTabs}
                onSelect={() => onSelectActivity(activity)}
              />
              ) : (
                <NavigationActivityHover
                  activity={activity}
                  active={active}
                  open={previewActivityId === activity.id}
                  openInTabs={openInTabs}
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
      </div>
      <NavigationSidebarFooter isSettings={isSettings} />
    </aside>
  );
};
