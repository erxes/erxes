import {
  IconCalendarPlus,
  IconHash,
  IconProgressCheck,
  IconSettings,
  IconSourceCode,
  IconTag,
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
          <Filter.Item value="contentType">
            <IconTag />
            Content Type
          </Filter.Item>
          <Filter.Item value="docId">
            <IconHash />
            Document ID
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
                const value = e.currentTarget.value.trim();
                const paramKeys = Array.from(searchParams.keys());

                if (value && !paramKeys?.includes(value)) {
                  setQueries({ [value]: '' });
                }
              }
            }}
          />
        </Command.List>
      </Command>
    </Filter.View>
  );
};
