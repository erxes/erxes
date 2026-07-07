import { useState } from 'react';
import {
  IconCalendarPlus,
  IconHash,
  IconProgressCheck,
  IconSourceCode,
  IconTag,
} from '@tabler/icons-react';
import { Combobox, Filter, Popover, useFilterQueryState } from 'erxes-ui';
import { SelectMember } from 'ui-modules';

import { formatLogContentTypeLabel } from '@/logs/constants/logFilter';
import { LogActionsFilter } from './LogActionFilter';
import { LogContentTypeFilter } from './LogContentTypeFilter';
import { LogSourceFilter } from './LogSourceFilter';
import { LogStatusFilter } from './LogStatusFilter';
import { LogsTotalCount } from '../LogsTotalCount';

/** Filter bar chip for the log status filter with a popover to change it. */
const LogStatusBarItem = () => {
  const [status] = useFilterQueryState<string>('status');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconProgressCheck />
        Status
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="status">
            {status || 'Set value'}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <LogStatusFilter onValueChange={() => setOpen(false)} />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

/** Filter bar chip for the log source filter with a popover to change it. */
const LogSourceBarItem = () => {
  const [source] = useFilterQueryState<string>('source');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="source">
      <Filter.BarName>
        <IconSourceCode />
        Source
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="source">
            {source || 'Set value'}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <LogSourceFilter onValueChange={() => setOpen(false)} />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

/** Filter bar chip for the log action filter with a popover to change it. */
const LogActionBarItem = () => {
  const [action] = useFilterQueryState<string>('action');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="action">
      <Filter.BarName>
        <IconProgressCheck />
        Action
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="action">
            {action || 'Set value'}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <LogActionsFilter onValueChange={() => setOpen(false)} />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

/** Filter bar chip for the log content type filter with a popover to change it. */
const LogContentTypeBarItem = () => {
  const [contentType] = useFilterQueryState<string>('contentType');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="contentType">
      <Filter.BarName>
        <IconTag />
        Content Type
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="contentType">
            {formatLogContentTypeLabel(contentType) || 'Set value'}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <LogContentTypeFilter onValueChange={() => setOpen(false)} />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

/** Filter bar for the logs list with active filter chips and total count. */
export const LogsFilterBar = () => {
  const [source] = useFilterQueryState<string>('source');
  const [docId] = useFilterQueryState<string>('docId');

  return (
    <>
      <LogStatusBarItem />
      <LogSourceBarItem />
      {source && <LogActionBarItem />}
      <SelectMember.FilterBar queryKey="userIds" />
      <LogContentTypeBarItem />

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
