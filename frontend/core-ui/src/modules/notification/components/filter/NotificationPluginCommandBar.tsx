import { NotificationIcon } from '@/notification/components/NotificationIcon';
import { NOTIFICATION_APP_COLORS } from '@/notification/constants/notifications';
import { IconCheck } from '@tabler/icons-react';
import { Command, Spinner, cn } from 'erxes-ui';
import { useNotificationPluginFilter } from '@/notification/hooks/useNotificationPluginFilter';
import { useTranslation } from 'react-i18next';

export const NotificationPluginCommandBar = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { t: pluginLabel } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { selectedPlugin, pluginNames, loading, selectPlugin } =
    useNotificationPluginFilter();

  return (
    <Command>
      <Command.Input placeholder={t('search')} focusOnMount />
      <Command.List>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Command.Empty />
            {pluginNames.map((name) => (
              <Command.Item
                key={name}
                value={name}
                keywords={[pluginLabel(name, name)]}
                onSelect={() => selectPlugin(name)}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full',
                    NOTIFICATION_APP_COLORS[name] ||
                      'bg-muted text-muted-foreground',
                  )}
                >
                  <NotificationIcon contentType={`${name}:`} />
                </span>
                <span className="capitalize">{pluginLabel(name, name)}</span>
                {selectedPlugin === name && <IconCheck className="ml-auto" />}
              </Command.Item>
            ))}
          </>
        )}
      </Command.List>
    </Command>
  );
};
