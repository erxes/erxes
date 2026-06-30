import { NOTIFICATION_TYPE_ICONS } from '@/notification/constants/notifications';
import { IconCheck } from '@tabler/icons-react';
import { Command, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NotificationTypeCommandBar = () => {
  const { t } = useTranslation('notification');
  const [type, setType] = useQueryState<string>('type');
  return (
    <Command>
      <Command.Input placeholder={t('search', 'Search')} focusOnMount />
      <Command.List>
        <Command.Empty />
        {['info', 'success', 'warning', 'error'].map((value) => {
          const Icon =
            NOTIFICATION_TYPE_ICONS[
              value as keyof typeof NOTIFICATION_TYPE_ICONS
            ];
          return (
            <Command.Item
              key={value}
              value={value}
              onSelect={() => setType(type === value ? null : value)}
            >
              <Icon />
              <span className="capitalize">{value}</span>
              {type === value && <IconCheck className="ml-auto" />}
            </Command.Item>
          );
        })}
      </Command.List>
    </Command>
  );
};
