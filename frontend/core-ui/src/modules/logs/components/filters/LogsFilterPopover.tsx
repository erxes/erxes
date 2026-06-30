import {
  IconCalendarPlus,
  IconHash,
  IconProgressCheck,
  IconSourceCode,
  IconTag,
  IconUser,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useMultiQueryState,
} from 'erxes-ui';
import { SelectMember } from 'ui-modules';

import { LogActionsFilter } from './LogActionFilter';
import { LogContentTypeFilter } from './LogContentTypeFilter';
import { LogDocIdFilter } from './LogDocIdFilter';
import { LogSourceFilter } from './LogSourceFilter';
import { LogStatusFilter } from './LogStatusFilter';

export const LogsFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    status: string;
    source: string;
    action: string;
    userIds: string[];
    createdAt: string;
    contentType: string;
    docId: string;
  }>([
    'status',
    'source',
    'action',
    'userIds',
    'createdAt',
    'contentType',
    'docId',
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope="logs_page">
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1 max-h-none">
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
                    <IconProgressCheck />
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
                <Filter.Item value="docId" inDialog>
                  <IconHash />
                  Document ID
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="createdAt">
                  <IconCalendarPlus />
                  Created At
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <Filter.View filterKey="status">
            <LogStatusFilter />
          </Filter.View>
          <Filter.View filterKey="source">
            <LogSourceFilter />
          </Filter.View>
          <Filter.View filterKey="action">
            <LogActionsFilter />
          </Filter.View>
          <Filter.View filterKey="userIds">
            <SelectMember.FilterView queryKey="userIds" />
          </Filter.View>
          <Filter.View filterKey="contentType">
            <LogContentTypeFilter />
          </Filter.View>
          <Filter.View filterKey="docId">
            <LogDocIdFilter />
          </Filter.View>
          <Filter.View filterKey="createdAt">
            <Filter.DateView filterKey="createdAt" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="docId" inDialog>
          <Filter.DialogStringView filterKey="docId" />
        </Filter.View>
        <Filter.View filterKey="status" inDialog>
          <LogStatusFilter />
        </Filter.View>
        <Filter.View filterKey="source" inDialog>
          <LogSourceFilter />
        </Filter.View>
        {queries?.source && (
          <Filter.View filterKey="action" inDialog>
            <LogActionsFilter />
          </Filter.View>
        )}
        <Filter.View filterKey="contentType" inDialog>
          <LogContentTypeFilter />
        </Filter.View>
        <Filter.View filterKey="createdAt" inDialog>
          <Filter.DialogDateView filterKey="createdAt" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};
