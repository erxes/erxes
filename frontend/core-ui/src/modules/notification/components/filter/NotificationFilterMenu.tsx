import { Command, Filter } from 'erxes-ui';
import {
  IconCalendar,
  IconEyeUp,
  IconLock,
  IconNotification,
  IconUserUp,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const NotificationFilterMenu = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  return (
    <Filter.View>
      <Command>
        <Filter.CommandInput
          placeholder={t('filter')}
          variant="secondary"
          className="bg-background"
        />
        <Command.Separator />
        <Command.List className="p-1">
          <Filter.Item value="notificationType">
            <IconNotification />
            {t('notification-type')}
          </Filter.Item>
          <Filter.Item value="notificationPriority">
            <IconEyeUp />
            {t('priority')}
          </Filter.Item>

          <Filter.Item value="notificationModule">
            <IconLock />
            {t('approval')}
          </Filter.Item>

          <Filter.Item value="notificationCreatedAt">
            <IconCalendar />
            {t('filter-by-date')}
          </Filter.Item>
          <Command.Separator className="my-1" />
          <Filter.Item value="notificationFromUserId">
            <IconUserUp />
            {t('filter-by-sender')}
          </Filter.Item>
        </Command.List>
      </Command>
    </Filter.View>
  );
};
