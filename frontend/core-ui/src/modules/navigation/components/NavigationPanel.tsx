import { NavigationCorePanelContent } from '@/navigation/components/NavigationCoreModules';
import { NavigationPluginPanelContent } from '@/navigation/components/NavigationPlugins';
import { SidebarNavigationFavorites } from '@/navigation/components/SidebarNavigationFavorites';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { SettingsSidebar } from '@/settings/components/SettingsSidebar';
import { ScrollArea, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NavigationPanel = ({
  activity,
  isSettings,
}: {
  activity?: INavigationActivity;
  isSettings: boolean;
}) => {
  const { t } = useTranslation('organization');
  const { isMobile, open } = Sidebar.useSidebar();

  if (!open && !isMobile) {
    return null;
  }

  const title = isSettings ? t('settings') : activity?.label;

  return (
    <aside className="flex min-w-0 flex-1 flex-col bg-sidebar">
      <header className="flex h-10 shrink-0 items-center gap-2 px-3">
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
          {title}
        </span>
        <Sidebar.Trigger className="size-6 text-accent-foreground" />
      </header>
      {isSettings ? (
        <SettingsSidebar hideExit />
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <SidebarNavigationFavorites />
          <div className="mx-3 mb-2 h-px bg-border" />
          {activity?.kind === 'plugin' && (
            <NavigationPluginPanelContent activityId={activity.id} />
          )}
          {activity?.kind === 'core' && (
            <NavigationCorePanelContent activity={activity} />
          )}
        </ScrollArea>
      )}
    </aside>
  );
};
