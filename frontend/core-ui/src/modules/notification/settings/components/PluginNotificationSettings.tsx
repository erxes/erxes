import { IconNotification, IconNotificationOff } from '@tabler/icons-react';
import {
  Breadcrumb,
  Empty,
  PageContainer,
  ScrollArea,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SettingsHeader } from 'ui-modules';
import { NotificationSettingsProvider } from '../context/NotificationSettingsProvider';
import { useNotificationPluginsTypes } from '../hooks/useNotificationPluginsTypes';
import { NotificationSettingsModule } from './NotificationSettingsModule';
import { NotificationSettingsPluginCard } from './NotificationSettingsPluginCard';

const PluginNotificationBreadcrumb = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <Breadcrumb.Item>
          <Breadcrumb.Page className="flex items-center gap-2 px-2">
            <IconNotification className="size-4" />
            {t('notifications')}
          </Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};

/**
 * A plugin's notification choices inside its own settings: every module of
 * the plugin on one page. The same choices as Settings → Notification.
 */
export const PluginNotificationSettings = ({
  pluginName,
}: {
  pluginName: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { pluginsNotifications, loading } = useNotificationPluginsTypes();

  const modules =
    pluginsNotifications.find((plugin) => plugin.pluginName === pluginName)
      ?.modules || [];

  return (
    <PageContainer>
      <SettingsHeader breadcrumbs={<PluginNotificationBreadcrumb />} />
      <ScrollArea className="flex-auto">
        {loading ? (
          <Spinner />
        ) : !modules.length ? (
          <Empty className="m-3 min-h-80">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconNotificationOff />
              </Empty.Media>
              <Empty.Title>{t('no-notification-events')}</Empty.Title>
              <Empty.Description>
                {t('no-notification-events-description')}
              </Empty.Description>
            </Empty.Header>
          </Empty>
        ) : (
          <div className="space-y-3 mx-auto px-4 py-10 max-w-2xl">
            <NotificationSettingsProvider
              pluginName={pluginName}
              moduleName={modules[0].name}
            >
              <NotificationSettingsPluginCard />
            </NotificationSettingsProvider>

            {modules.map(({ name }) => (
              <NotificationSettingsProvider
                key={name}
                pluginName={pluginName}
                moduleName={name}
              >
                <NotificationSettingsModule />
              </NotificationSettingsProvider>
            ))}
          </div>
        )}
      </ScrollArea>
    </PageContainer>
  );
};
