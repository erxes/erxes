import { IconSortDescending } from '@tabler/icons-react';
import { Button, cn, Select, useMultiQueryState } from 'erxes-ui';
import { Select as SelectPrimitive } from 'radix-ui';
import { TNotificationStatus } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const NotificationSort = () => {
  const { t } = useTranslation('notification');
  const [
    { notificationOrderBy: orderBy, notificationStatus: status },
    setQueries,
  ] = useMultiQueryState<{
    notificationOrderBy: string;
    notificationStatus: TNotificationStatus;
  }>(['notificationOrderBy', 'notificationStatus']);
  return (
    <Select
      defaultValue={orderBy || 'new'}
      onValueChange={(value) =>
        setQueries({ notificationOrderBy: value === orderBy ? null : value })
      }
    >
      <SelectPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon">
          <IconSortDescending
            className={cn(orderBy && orderBy !== 'new' && 'text-primary')}
          />
        </Button>
      </SelectPrimitive.Trigger>
      <Select.Content>
        <Select.Item value="new">{t('newest', 'Newest')}</Select.Item>
        <Select.Item value="old">{t('oldest', 'Oldest')}</Select.Item>
        <Select.Item value="priority">{t('priority', 'Priority')}</Select.Item>
        {status && status !== 'unread' && (
          <Select.Item value="readAt">{t('read-at', 'Read at')}</Select.Item>
        )}
      </Select.Content>
    </Select>
  );
};
