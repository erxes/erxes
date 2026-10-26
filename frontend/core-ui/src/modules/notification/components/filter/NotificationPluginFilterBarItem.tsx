import { NotificationIcon } from '@/notification/components/NotificationIcon';
import { NotificationPluginCommandBar } from './NotificationPluginCommandBar';
import { IconApps } from '@tabler/icons-react';
import { Combobox, Filter, Popover, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NotificationPluginFilterBarItem = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { t: pluginLabel } = useTranslation('common', { keyPrefix: 'sidebar' });
  const [plugin] = useQueryState<string>('notificationPlugin');

  return (
    <Filter.BarItem queryKey="notificationPlugin">
      <Filter.BarName>
        <IconApps />
        {t('plugin', 'Plugin')}
      </Filter.BarName>
      <Popover>
        <Popover.Trigger asChild>
          <Filter.BarButton className="capitalize">
            <NotificationIcon contentType={`${plugin}:`} />
            {pluginLabel(plugin || '', plugin || '')}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <NotificationPluginCommandBar />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};
