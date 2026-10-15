import { Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useNotificationPluginsTypes } from '../hooks/useNotificationPluginsTypes';

export const NotificationSettingsSidebar = () => {
  const { event } = useParams<{ event: string }>();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  const { pluginsNotifications } = useNotificationPluginsTypes();

  return (
    <Sidebar.Panel className="flex-none border-r" label={t('notification')}>
      {(pluginsNotifications || []).map(({ pluginName, modules }) => (
        <Sidebar.Group key={pluginName}>
          <Sidebar.GroupLabel>{`${pluginName} plugin`}</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {(modules || []).map(({ name: moduleName }) => {
                const notificationEvent = `${pluginName}:${moduleName}`;

                return (
                  <Sidebar.MenuItem key={moduleName}>
                    <Sidebar.MenuButton
                      isActive={notificationEvent === event}
                      asChild
                    >
                      <Link to={`/settings/notification/${notificationEvent}`}>
                        <span className="capitalize">{moduleName}</span>
                      </Link>
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                );
              })}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      ))}
    </Sidebar.Panel>
  );
};
