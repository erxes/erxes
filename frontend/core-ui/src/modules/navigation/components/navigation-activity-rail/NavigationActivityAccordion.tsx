import { NavigationActivityButton } from '@/navigation/components/navigation-activity-rail/NavigationActivityButton';
import { NavigationCorePanelContent } from '@/navigation/components/NavigationCoreModules';
import { NavigationDisclosure } from '@/navigation/components/NavigationDisclosure';
import {
  NavigationPluginContextContent,
  NavigationPluginPanelContent,
} from '@/navigation/components/NavigationPlugins';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { Sidebar } from 'erxes-ui';

export const NavigationActivityAccordion = ({
  activity,
  active,
  open,
  pinned,
  onPinnedChange,
  onToggle,
}: Readonly<{
  activity: INavigationActivity;
  active: boolean;
  open: boolean;
  pinned: boolean;
  onPinnedChange: (pinned: boolean) => void;
  onToggle: () => void;
}>) => {
  const { isMobile } = Sidebar.useSidebar();

  return (
    <div className="flex w-full shrink-0 flex-col">
      <NavigationActivityButton
        activity={activity}
        active={active}
        expanded
        open={open}
        pinned={pinned}
        onPinnedChange={onPinnedChange}
        onSelect={onToggle}
      />
      <NavigationDisclosure open={open}>
        <div className="ml-3.5 border-l pl-1.5 **:data-[sidebar=group]:px-0">
          {activity.kind === 'plugin' ? (
            <>
              <NavigationPluginPanelContent activityId={activity.id} />
              {isMobile && (
                <NavigationPluginContextContent activityId={activity.id} />
              )}
            </>
          ) : (
            <NavigationCorePanelContent activity={activity} />
          )}
        </div>
      </NavigationDisclosure>
    </div>
  );
};
