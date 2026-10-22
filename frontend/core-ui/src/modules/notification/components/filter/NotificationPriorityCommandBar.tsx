import { IconCheck } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NotificationPriorityCommandBar = ({
  priority,
  setQueries,
}: {
  priority?: string | null;
  setQueries: (
    values: Partial<{
      notificationPriority?: string | null;
    }>,
  ) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  return (
    <Command>
      <Command.Input placeholder={t('search')} />
      <Command.List>
        <Command.Empty />
        {['low', 'medium', 'high', 'urgent'].map((value) => (
          <Command.Item
            key={value}
            value={value}
            onSelect={() =>
              setQueries({
                notificationPriority: priority === value ? null : value,
              })
            }
          >
            <span className="capitalize">{value}</span>
            {priority === value && <IconCheck className="ml-auto" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
