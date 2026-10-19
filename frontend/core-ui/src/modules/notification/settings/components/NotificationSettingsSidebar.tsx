import { IconSettings } from '@tabler/icons-react';
import { Sidebar } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';
import { currentUserState, useVersion } from 'ui-modules';
import { useNotificationPluginsTypes } from '../hooks/useNotificationPluginsTypes';

const NOTIFICATION_CONFIG_PATH = '/settings/notification/config';

export const NotificationSettingsSidebar = () => {
  const { event } = useParams<{ event: string }>();
  const { pathname } = useLocation();
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { t: notificationT } = useTranslation('common', {
    keyPrefix: 'notification',
  });
  const currentUser = useAtomValue(currentUserState);
  const isOs = useVersion();

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
      {currentUser?.isOwner && isOs && (
        <Sidebar.Footer className="sticky bottom-0 mt-auto bg-sidebar">
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={pathname === NOTIFICATION_CONFIG_PATH}
                asChild
              >
                <Link to={NOTIFICATION_CONFIG_PATH}>
                  <IconSettings />
                  <span>{notificationT('configuration')}</span>
                </Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.Footer>
      )}
    </Sidebar.Panel>
  );
};
