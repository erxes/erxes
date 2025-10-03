import {
  IconCalendarPlus,
  IconProgressCheck,
  IconSettings,
  IconSourceCode,
  IconUser,
} from '@tabler/icons-react';
import { Command, Filter, Input, useMultiQueryState } from 'erxes-ui';
import { useSearchParams } from 'react-router';

export const LogRecordTableFilterMenu = () => {
  const [searchParams] = useSearchParams();

  const [queries, setQueries] = useMultiQueryState<{ source: string }>([
    'source',
  ]);
  return (
    <Filter.View>
      <Command>
        <Filter.CommandInput
          placeholder="Filter"
          variant="secondary"
          className="bg-background"
        />
        <Command.List className="p-1">
          <Filter.Item value="status">
            <IconProgressCheck />
            Status
          </Filter.Item>
          <Filter.Item value="source">
            <IconSourceCode />
            Source
          </Filter.Item>
          {queries?.source && (
            <Filter.Item value="action">
              <IconSettings />
              Action
            </Filter.Item>
          )}
          <Filter.Item value="userIds">
            <IconUser />
            User
          </Filter.Item>
          <Command.Separator className="my-1" />
          <Filter.Item value="createdAt">
            <IconCalendarPlus />
            Created At
          </Filter.Item>
          <Command.Separator />
          <Input
            className="p-2m mt-2"
            placeholder="Type a custom field name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = e.currentTarget.value;
                const paramKeys = Array.from(searchParams.keys());

                if (!paramKeys?.includes(value)) {
                  setQueries({ [e.currentTarget.value]: '' });
                }
              }
            }}
          />
        </Command.List>
      </Command>
    </Filter.View>
  );
};
