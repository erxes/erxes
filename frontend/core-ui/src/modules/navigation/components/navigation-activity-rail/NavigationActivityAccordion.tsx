import { NavigationActivityButton } from '@/navigation/components/navigation-activity-rail/NavigationActivityButton';
import { NavigationCorePanelContent } from '@/navigation/components/NavigationCoreModules';
import { NavigationDisclosure } from '@/navigation/components/NavigationDisclosure';
import {
  NavigationPluginContextContent,
  NavigationPluginPanelContent,
} from '@/navigation/components/NavigationPlugins';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { cn, Sidebar } from 'erxes-ui';
import { useRef } from 'react';

const findActiveRailItem = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      '[data-sidebar=menu-button][data-active=true]',
    ),
  ).find(
    (button) =>
      !button.closest('[data-sidebar=menu-sub]') &&
      !button
        .closest('[data-sidebar=menu-item]')
        ?.querySelector('[data-sidebar=menu-sub]'),
  ) ?? null;

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
  const treeRef = useRef<HTMLDivElement>(null);

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
        <div
          ref={treeRef}
          className={cn(
            'relative ml-3.5 border-l pl-3 **:data-[sidebar=group]:px-0',
            '[&_[data-sidebar=menu-button]>svg:first-child]:hidden [&_[data-sidebar=menu-sub-button]>svg:first-child]:hidden',
            '[&_[data-sidebar=menu-button]]:font-normal [&_[data-sidebar=menu-sub-button]]:font-normal [&_[data-sidebar=menu-button][data-active=true]]:font-medium [&_[data-sidebar=menu-sub-button][data-active=true]]:font-medium',
            '[&_[data-sidebar=menu-button]:not([data-active=true]):not(:hover)]:text-muted-foreground',
          )}
        >
          <Sidebar.TreeIndicator
            containerRef={treeRef}
            findActive={findActiveRailItem}
          />
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
