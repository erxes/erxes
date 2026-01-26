import { IconSortDescending } from '@tabler/icons-react';
import { Button, cn, Select, useMultiQueryState } from 'erxes-ui';
import { Select as SelectPrimitive } from 'radix-ui';
import { NotificationStatusT } from '../types/notifications';

export const NotificationSort = () => {
  const [{ notificationOrderBy: orderBy, notificationStatus: status }, setQueries] = useMultiQueryState<{
    notificationOrderBy: string;
    notificationStatus: NotificationStatusT;
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
        <Select.Item value="new">Newest</Select.Item>
        <Select.Item value="old">Oldest</Select.Item>
        <Select.Item value="priority">Priority</Select.Item>
        {status && status !== 'unread' && (
          <Select.Item value="readAt">Read at</Select.Item>
        )}
      </Select.Content>
    </Select>
  );
};
