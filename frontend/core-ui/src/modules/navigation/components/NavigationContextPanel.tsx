import { MainNavigationBar } from '@/navigation/components/MainNavigationBar';
import { NavigationPluginPanel } from '@/navigation/components/NavigationPlugins';
import { NavigationPanelHeader } from '@/navigation/components/NavigationPanelHeader';
import { SidebarNavigationFavorites } from '@/navigation/components/SidebarNavigationFavorites';
import { SettingsSidebar } from '@/settings/components/SettingsSidebar';
import { Sidebar } from 'erxes-ui';

interface NavigationContextPanelProps {
  isOpen: boolean;
  isSettings: boolean;
  onCollapse: () => void;
  onPreviewActivate: () => void;
  onPreviewEnter: () => void;
  onPreviewEnd: () => void;
  previewPluginId: string | null;
}

export const NavigationContextPanel = ({
  isOpen,
  isSettings,
  onCollapse,
  onPreviewActivate,
  onPreviewEnter,
  onPreviewEnd,
  previewPluginId,
}: NavigationContextPanelProps) => {
  if (isOpen) {
    return (
      <Sidebar
        className="shrink-0 border-r"
        collapsible="none"
        style={{ width: '16rem' }}
      >
        {isSettings ? (
          <SettingsSidebar />
        ) : (
          <MainNavigationBar onCollapse={onCollapse} />
        )}
      </Sidebar>
    );
  }

  if (!previewPluginId || isSettings) {
    return null;
  }

  return (
    <aside
      className="absolute bottom-2 left-14 top-2 z-30 flex w-64 flex-col rounded-md border bg-background shadow-lg"
      onMouseEnter={onPreviewEnter}
      onMouseLeave={onPreviewEnd}
    >
      <NavigationPanelHeader
        onOpen={onPreviewActivate}
        pluginId={previewPluginId}
      />
      <Sidebar.Content className="gap-0">
        <SidebarNavigationFavorites />
        <NavigationPluginPanel activePlugin={previewPluginId} />
      </Sidebar.Content>
    </aside>
  );
};
