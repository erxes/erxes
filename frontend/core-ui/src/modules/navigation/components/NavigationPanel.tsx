import { NavigationPluginPanelContent } from '@/navigation/components/NavigationPlugins';
import { SidebarNavigationFavorites } from '@/navigation/components/SidebarNavigationFavorites';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePluginsNavigationGroups } from '@/navigation/hooks/usePluginsNavigationGroups';
import {
  navigationPanelOpenState,
  navigationPanelViewState,
} from '@/navigation/states/navigationPanelState';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import { SettingsSidebar } from '@/settings/components/SettingsSidebar';
import { AppPath } from '@/types/paths/AppPath';
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from '@tabler/icons-react';
import { Button, cn, ScrollArea, Sidebar } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const NavigationPanel = () => {
  const activities = useNavigationActivities();
  const navigationGroups = usePluginsNavigationGroups();
  const [panelOpen, setPanelOpen] = useAtom(navigationPanelOpenState);
  const panelView = useAtomValue(navigationPanelViewState);
  const { pathname } = useLocation();
  const { isMobile } = Sidebar.useSidebar();
  const { t: navigationT } = useTranslation('common', {
    keyPrefix: 'navigation',
  });
  const { t: organizationT } = useTranslation('organization');
  const { t: sidebarT } = useTranslation('common', {
    keyPrefix: 'sidebar',
  });
  const isSettings = pathname.includes(`/${AppPath.Settings}`);
  const activity = findNavigationActivityByPath(activities, pathname);
  const navigationGroup =
    activity?.kind === 'plugin' ? navigationGroups[activity.id] : undefined;
  const hasActivityPanel = Boolean(
    navigationGroup?.contents.length || navigationGroup?.subGroups.length,
  );
  const isFavorites = panelView === 'favorites';
  const shouldShowPanel = isSettings || isFavorites || hasActivityPanel;
  const title = isFavorites
    ? sidebarT('favorites')
    : isSettings
    ? organizationT('settings')
    : activity?.label;
  const toggleLabel = navigationT(
    panelOpen ? 'collapse-plugin-navigation' : 'expand-plugin-navigation',
  );

  if (!shouldShowPanel) {
    return null;
  }

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 ease-linear',
        panelOpen && isMobile && 'min-w-0 flex-1',
        panelOpen && !isMobile && 'w-64',
        !panelOpen && 'w-10',
      )}
    >
      <header
        className={cn(
          'flex h-14 shrink-0 items-center gap-2',
          panelOpen ? 'px-2' : 'justify-center px-1',
        )}
      >
        <Button
          aria-label={toggleLabel}
          className="size-8 shrink-0"
          onClick={() => setPanelOpen((open) => !open)}
          size="icon"
          title={toggleLabel}
          variant="ghost"
        >
          {panelOpen ? (
            <IconLayoutSidebarLeftCollapse />
          ) : (
            <IconLayoutSidebarLeftExpand />
          )}
        </Button>
        {panelOpen && (
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
            {title}
          </span>
        )}
      </header>
      {panelOpen &&
        (isFavorites ? (
          <ScrollArea className="min-h-0 flex-1">
            <SidebarNavigationFavorites />
          </ScrollArea>
        ) : isSettings ? (
          <SettingsSidebar hideExit />
        ) : (
          <ScrollArea className="min-h-0 flex-1">
            {activity?.kind === 'plugin' && (
              <NavigationPluginPanelContent activityId={activity.id} />
            )}
          </ScrollArea>
        ))}
    </aside>
  );
};
