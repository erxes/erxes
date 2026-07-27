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
  const { t } = useTranslation('notification');
  const [status, setStatus] = useQueryState<string>('notificationStatus');

  return (
    <Filter.View>
      <Command>
        <Filter.CommandInput
          placeholder={t('filter', 'Filter')}
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
              aria-label="Toggle unread"
              value="unread"
              className="flex-1"
            >
              {t('unread', 'Unread')}
            </ToggleGroup.Item>
            <ToggleGroup.Item
              aria-label="Toggle all"
              value="all"
              className="flex-1"
            >
              {t('all', 'All')}
            </ToggleGroup.Item>
            <ToggleGroup.Item
              aria-label="Toggle Read"
              value="read"
              className="flex-1"
            >
              {t('read', 'Read')}
            </ToggleGroup.Item>
          </ToggleGroup>
        </div>
        <Command.Separator />
        <Command.List className="p-1">
          <Filter.Item value="type">
            <IconNotification />
            {t('notification-type', 'Notification Type')}
          </Filter.Item>
          <Filter.Item value="priority">
            <IconEyeUp />
            {t('priority', 'Priority')}
          </Filter.Item>

          <Filter.Item value="module">
            <IconLock />
            Approval
          </Filter.Item>

          <Filter.Item value="createdAt">
            <IconCalendar />
            {t('filter-by-date', 'Filter by date')}
          </Filter.Item>
          <Command.Separator className="my-1" />
          <Filter.Item value="fromUserId">
            <IconUserUp />
            {t('filter-by-sender', 'Filter by sender')}
          </Filter.Item>
        </Command.List>
      </Command>
    </Filter.View>
  );
};
