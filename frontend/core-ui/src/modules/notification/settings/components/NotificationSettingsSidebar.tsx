import { Sidebar } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { useNotificationPluginsTypes } from '../hooks/useNotificationPluginsTypes';

export const NotificationSettingsSidebar = () => {
  const { event } = useParams<{ event: string }>();

  const { pluginsNotifications } = useNotificationPluginsTypes();

  return (
    <Sidebar.Panel className="flex-none border-r">
      {(pluginsNotifications || []).map(({ pluginName, modules }, index) => (
        <Sidebar.Group key={pluginName}>
          <div className="mb-1 flex items-center">
            <Sidebar.GroupLabel className="min-w-0 flex-1">{`${pluginName} plugin`}</Sidebar.GroupLabel>
            {index === 0 && <Sidebar.PanelTrigger />}
          </div>
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
