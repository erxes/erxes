import { IconSortDescending } from '@tabler/icons-react';
import { Button, cn, Select, useMultiQueryState } from 'erxes-ui';
import { Select as SelectPrimitive } from 'radix-ui';

export const NotificationSort = () => {
  const [{ orderBy, status }, setQueries] = useMultiQueryState<{
    orderBy: string;
    status: 'read' | 'unread' | 'all';
  }>(['orderBy', 'status']);

  return (
    <Select
      defaultValue={orderBy || 'new'}
      onValueChange={(value) =>
        setQueries({ orderBy: value === orderBy ? null : value })
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
