import {
  IconCalendarPlus,
  IconHash,
  IconProgressCheck,
  IconSourceCode,
  IconTag,
} from '@tabler/icons-react';
import {
  Combobox,
  Filter,
  Popover,
  useFilterQueryState,
} from 'erxes-ui';
import { SelectMember } from 'ui-modules';

import { formatLogContentTypeLabel } from '@/logs/constants/logFilter';
import { LogActionsFilter } from './LogActionFilter';
import { LogContentTypeFilter } from './LogContentTypeFilter';
import { LogSourceFilter } from './LogSourceFilter';
import { LogStatusFilter } from './LogStatusFilter';
import { LogsTotalCount } from '../LogsTotalCount';

export const LogsFilterBar = () => {
  const [status] = useFilterQueryState<string>('status');
  const [source] = useFilterQueryState<string>('source');
  const [action] = useFilterQueryState<string>('action');
  const [contentType] = useFilterQueryState<string>('contentType');
  const [docId] = useFilterQueryState<string>('docId');

  return (
    <>
      <Filter.BarItem queryKey="status">
        <Filter.BarName>
          <IconProgressCheck />
          Status
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>{status || 'Set value'}</Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <LogStatusFilter />
          </Combobox.Content>
        </Popover>
      </Filter.BarItem>

      <Filter.BarItem queryKey="source">
        <Filter.BarName>
          <IconSourceCode />
          Source
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>{source || 'Set value'}</Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <LogSourceFilter />
          </Combobox.Content>
        </Popover>
      </Filter.BarItem>

      {source && (
        <Filter.BarItem queryKey="action">
          <Filter.BarName>
            <IconProgressCheck />
            Action
          </Filter.BarName>
          <Popover>
            <Popover.Trigger>
              <Filter.BarButton>{action || 'Set value'}</Filter.BarButton>
            </Popover.Trigger>
            <Combobox.Content>
              <LogActionsFilter />
            </Combobox.Content>
          </Popover>
        </Filter.BarItem>
      )}

      <SelectMember.FilterBar queryKey="userIds" />

      <Filter.BarItem queryKey="contentType">
        <Filter.BarName>
          <IconTag />
          Content Type
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton>
              {formatLogContentTypeLabel(contentType) || 'Set value'}
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <LogContentTypeFilter />
          </Combobox.Content>
        </Popover>
      </Filter.BarItem>

      <Filter.BarItem queryKey="docId">
        <Filter.BarName>
          <IconHash />
          Document ID
        </Filter.BarName>
        <Filter.BarButton filterKey="docId" inDialog>
          {docId || 'Set value'}
        </Filter.BarButton>
      </Filter.BarItem>

      <Filter.BarItem queryKey="createdAt">
        <Filter.BarName>
          <IconCalendarPlus />
          Created At
        </Filter.BarName>
        <Filter.Date filterKey="createdAt" />
      </Filter.BarItem>

      <LogsTotalCount />
    </>
  );
};
