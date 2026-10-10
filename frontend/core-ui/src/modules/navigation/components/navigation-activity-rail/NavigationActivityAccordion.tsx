import {
  NavigationPluginContextContent,
  NavigationPluginPanelContent,
} from '@/navigation/components/navigation-activity-rail/NavigationPlugins';
import { Sidebar, cn } from 'erxes-ui';

import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { NavigationActivityButton } from '@/navigation/components/navigation-activity-rail/NavigationActivityButton';
import { NavigationChildControlsProvider } from '@/navigation/components/navigation-activity-rail/NavigationChildControlsProvider';
import { NavigationCorePanelContent } from '@/navigation/components/navigation-activity-rail/NavigationCoreModules';
import { NavigationDisclosure } from '@/navigation/components/navigation-activity-rail/NavigationDisclosure';
import { TNavigationActivityMoveDirection } from '@/navigation/utils/navigationActivityOrder';
import { useRef } from 'react';

const findActiveChild = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(
    ':is([data-sidebar=menu-button],[data-sidebar=menu-sub-button])[data-active=true]',
  );

export const NavigationActivityAccordion = ({
  activity,
  active,
  canMoveDown,
  canMoveUp,
  open,
  pinned,
  onMove,
  onPinnedChange,
  onToggle,
}: Readonly<{
  activity: INavigationActivity;
  active: boolean;
  canMoveDown: boolean;
  canMoveUp: boolean;
  open: boolean;
  pinned: boolean;
  onMove: (direction: TNavigationActivityMoveDirection) => void;
  onPinnedChange: (pinned: boolean) => void;
  onToggle: () => void;
}>) => {
  const { isMobile } = Sidebar.useSidebar();
  const childrenRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex w-full shrink-0 flex-col">
      <NavigationActivityButton
        activity={activity}
        active={active}
        canMoveDown={canMoveDown}
        canMoveUp={canMoveUp}
        expanded
        open={open}
        pinned={pinned}
        onMove={onMove}
        onPinnedChange={onPinnedChange}
        onSelect={onToggle}
      />
      <NavigationDisclosure open={open}>
        <div
          ref={childrenRef}
          className={cn(
            'nav-activity-accordion relative ml-4 border-l border-border/60 pl-2 **:data-[sidebar=group]:px-0',
          )}
        >
          <Sidebar.TreeIndicator
            containerRef={childrenRef}
            findActive={findActiveChild}
          />
          <NavigationChildControlsProvider activity={activity}>
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
          </NavigationChildControlsProvider>
        </div>
      </NavigationDisclosure>
    </div>
  );
};
