import { NOTIFICATION_TYPE_ICONS } from '@/notification/my-inbox/constants/notifications';
import { IconCheck } from '@tabler/icons-react';
import { Command, useQueryState } from 'erxes-ui';

export const NotificationTypeCommandBar = () => {
  const [type, setType] = useQueryState<string>('type');
  return (
    <Command>
      <Command.Input placeholder="Search" focusOnMount />
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
