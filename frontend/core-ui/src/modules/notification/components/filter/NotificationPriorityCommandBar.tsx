import { IconCheck } from '@tabler/icons-react';
import { NotificationPriority } from '@/notification/components/NotificationPriority';
import { NOTIFICATION_PRIORITIES } from '@/notification/constants/notifications';
import { Command, useMultiQueryState } from 'erxes-ui';
import type { NotificationFilterQueries } from '@/notification/types/notificationFilters';
import { useTranslation } from 'react-i18next';

export const NotificationPriorityCommandBar = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const [{ notificationPriority: priority }, setQueries] = useMultiQueryState<
    Pick<NotificationFilterQueries, 'notificationPriority'>
  >(['notificationPriority']);
  return (
    <Command>
      <Command.Input placeholder={t('search')} />
      <Command.List>
        <Command.Empty />
        {NOTIFICATION_PRIORITIES.map(({ value, label, translationKey }) => (
          <Command.Item
            key={value}
            value={value}
            keywords={[label, t(translationKey, label)]}
            onSelect={() =>
              setQueries({
                notificationPriority: priority === value ? null : value,
              })
            }
          >
            <NotificationPriority priority={value} />
            {priority === value && <IconCheck className="ml-auto" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
