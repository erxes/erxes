import { Command, Filter, ToggleGroup, useQueryState } from 'erxes-ui';
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
  const [status, setStatus] = useQueryState<string>('notificationStatus');

  return (
    <Filter.View>
      <Command>
        <Filter.CommandInput
          placeholder={t('filter')}
          variant="secondary"
          className="bg-background"
        />
        <div className="p-1">
          <ToggleGroup
            type="single"
            value={status || 'unread'}
            onValueChange={(value) => setStatus(value)}
            variant="outline"
          >
            <ToggleGroup.Item
              aria-label={t('toggle-unread')}
              value="unread"
              className="flex-1"
            >
              {t('unread')}
            </ToggleGroup.Item>
            <ToggleGroup.Item
              aria-label={t('toggle-all')}
              value="all"
              className="flex-1"
            >
              {t('all')}
            </ToggleGroup.Item>
            <ToggleGroup.Item
              aria-label={t('toggle-read')}
              value="read"
              className="flex-1"
            >
              {t('read')}
            </ToggleGroup.Item>
          </ToggleGroup>
        </div>
        <Command.Separator />
        <Command.List className="p-1">
          <Filter.Item value="type">
            <IconNotification />
            {t('notification-type')}
          </Filter.Item>
          <Filter.Item value="priority">
            <IconEyeUp />
            {t('priority')}
          </Filter.Item>

          <Filter.Item value="module">
            <IconLock />
            {t('approval')}
          </Filter.Item>

          <Filter.Item value="createdAt">
            <IconCalendar />
            {t('filter-by-date')}
          </Filter.Item>
          <Command.Separator className="my-1" />
          <Filter.Item value="fromUserId">
            <IconUserUp />
            {t('filter-by-sender')}
          </Filter.Item>
        </Command.List>
      </Command>
    </Filter.View>
  );
};
