import { NavigationPluginPanelContent } from '@/navigation/components/NavigationPlugins';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePluginsNavigationGroups } from '@/navigation/hooks/usePluginsNavigationGroups';
import { navigationPanelOpenState } from '@/navigation/states/navigationPanelState';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import { SettingsSidebar } from '@/settings/components/SettingsSidebar';
import { AppPath } from '@/types/paths/AppPath';
import { IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import { Button, cn, ScrollArea, Separator, Sidebar } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

/** Returns the responsive width and border styles for the navigation panel. */
const getNavigationPanelClassName = (panelOpen: boolean, isMobile: boolean) => {
  const baseClassName =
    'peer relative z-20 flex shrink-0 flex-col bg-sidebar transition-[width] duration-200 ease-out motion-reduce:transition-none';

  if (isMobile) {
    return cn(
      baseClassName,
      'h-full overflow-hidden border-r',
      panelOpen ? 'w-[calc(100%-3.5rem)]' : 'w-10',
    );
  }

  return cn(baseClassName, panelOpen ? 'h-full w-64 border-r' : 'h-full w-0');
};

export const NavigationPanel = () => {
  const activities = useNavigationActivities();
  const navigationGroups = usePluginsNavigationGroups();
  const [panelOpen, setPanelOpen] = useAtom(navigationPanelOpenState);
  const { pathname } = useLocation();
  const { isMobile } = Sidebar.useSidebar();
  const { t: navigationT } = useTranslation('common', {
    keyPrefix: 'navigation',
  });
  const { t: organizationT } = useTranslation('organization');
  const isSettings = pathname.includes(`/${AppPath.Settings}`);
  const activity = findNavigationActivityByPath(activities, pathname);
  const navigationGroup =
    activity?.kind === 'plugin' ? navigationGroups[activity.id] : undefined;
  const hasActivityPanel = Boolean(
    navigationGroup?.contents.length || navigationGroup?.subGroups.length,
  );
  const shouldShowPanel = isSettings || hasActivityPanel;
  let title = activity?.label;

  if (isSettings) {
    title = organizationT('settings');
  }

  const toggleLabel = navigationT(
    panelOpen ? 'collapse-plugin-navigation' : 'expand-plugin-navigation',
  );
  let panelContent = (
    <ScrollArea
      className="min-h-0 flex-1"
      viewportClassName="[&>div]:block! [&>div]:min-w-0"
    >
      {activity?.kind === 'plugin' && (
        <NavigationPluginPanelContent activityId={activity.id} />
      )}
    </ScrollArea>
  );

  if (isSettings) {
    panelContent = <SettingsSidebar hideExit />;
  }

  if (!shouldShowPanel) {
    return null;
  }

  return (
    <aside
      data-state={panelOpen ? 'expanded' : 'collapsed'}
      className={getNavigationPanelClassName(panelOpen, isMobile)}
    >
      <header
        className={cn(
          'flex h-13 w-full min-w-10 shrink-0 items-center gap-2 overflow-hidden pt-1',
          panelOpen ? 'px-2' : 'justify-center px-1',
        )}
      >
        <span
          aria-hidden={!panelOpen}
          className={cn(
            'min-w-0 flex-1 truncate px-1 text-[13px] font-semibold transition-opacity duration-100 motion-reduce:delay-0 motion-reduce:transition-none',
            panelOpen
              ? 'visible delay-100 opacity-100'
              : 'invisible delay-0 opacity-0',
          )}
        >
          {title}
        </span>
        <Button
          aria-label={toggleLabel}
          className="size-8 shrink-0"
          onClick={() => setPanelOpen((open) => !open)}
          size="icon"
          title={toggleLabel}
          variant="ghost"
        >
          {panelOpen ? <IconChevronsLeft /> : <IconChevronsRight />}
        </Button>
      </header>
      {!panelOpen && !isMobile && (
        <Separator.Inline className="absolute top-1/2 right-0 -translate-y-1/2" />
      )}
      <div
        aria-hidden={!panelOpen}
        className={cn(
          'min-h-0 w-full flex-1 overflow-hidden transition-opacity duration-100 motion-reduce:delay-0 motion-reduce:transition-none',
          panelOpen
            ? 'visible delay-100 opacity-100'
            : 'invisible delay-0 opacity-0',
        )}
      >
        <div className={cn('flex h-full flex-col', !isMobile && 'w-64')}>
          {panelContent}
        </div>
      </div>
    </aside>
  );
};
