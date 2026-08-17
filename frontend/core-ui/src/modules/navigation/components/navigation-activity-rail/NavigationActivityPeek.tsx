import { NavigationActivityPinButton } from '@/navigation/components/NavigationActivityPinButton';
import { NavigationCorePanelContent } from '@/navigation/components/NavigationCoreModules';
import { NavigationPluginPanelContent } from '@/navigation/components/NavigationPlugins';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { HoverCard, ScrollArea } from 'erxes-ui';

export const NavigationActivityPeek = ({
  activity,
  pinned,
  onPointerEnter,
  onPointerLeave,
  onPinnedChange,
}: Readonly<{
  activity: INavigationActivity;
  pinned: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onPinnedChange: (pinned: boolean) => void;
}>) => (
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
