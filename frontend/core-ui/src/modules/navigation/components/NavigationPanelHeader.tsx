import { usePluginDisplayName } from '@/navigation/hooks/usePluginDisplayName';
import { useNavigationTabs } from '@/navigation/hooks/useNavigationTabs';
import { Button, Sidebar } from 'erxes-ui';
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface NavigationPanelHeaderProps {
  onCollapse?: () => void;
  onOpen?: () => void;
  pluginId?: string;
}

export const NavigationPanelHeader = ({
  onCollapse,
  onOpen,
  pluginId,
}: NavigationPanelHeaderProps) => {
  const { activePlugin, navigationGroups } = useNavigationTabs();
  const { t } = useTranslation('common', { keyPrefix: 'navigation-shell' });
  const selectedPluginId = pluginId || activePlugin;
  const activeGroup = selectedPluginId
    ? navigationGroups[selectedPluginId]
    : undefined;
  const pluginName = usePluginDisplayName(
    activeGroup?.name || '',
    activeGroup?.i18n,
  );

  return (
    <Sidebar.Header className="h-10 shrink-0 flex-row items-center gap-2 border-b px-3 py-0">
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
        {pluginName || t('workspace')}
      </span>
      {onCollapse && (
        <Button
          aria-label={t('collapse-panel')}
          className="size-6 p-0"
          onClick={onCollapse}
          size="icon"
          title={t('collapse-panel')}
          variant="ghost"
        >
          <IconLayoutSidebarLeftCollapse className="size-4" />
        </Button>
      )}
      {onOpen && (
        <Button
          aria-label={t('open-panel')}
          className="size-6 p-0"
          onClick={onOpen}
          size="icon"
          title={t('open-panel')}
          variant="ghost"
        >
          <IconLayoutSidebarLeftExpand className="size-4" />
        </Button>
      )}
    </Sidebar.Header>
  );
};
