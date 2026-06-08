import { IconCalendar, IconUser } from '@tabler/icons-react';
import { Combobox, Filter, Popover, useMultiQueryState, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { SelectMember } from 'ui-modules';
import {
  SYNC_HISTORY_FILTER_KEYS,
  SyncHistoryFilterField,
  SyncHistoryFilterValues,
  TEXT_FILTER_FIELDS,
} from './MSDynamicSyncHistoryFilterFields';
import { MSDynamicSyncHistoryFilterPopover } from './MSDynamicSyncHistoryFilterPopover';
import { MSDynamicSyncHistoryTotalCount } from './MSDynamicSyncHistoryTotalCount';

const MSDynamicSyncHistoryUserFilterBarItem = () => {
  const [user, setUser] = useQueryState<string>('user');
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey="user">
      <Filter.BarName>
        <IconUser />
        Assigned To
      </Filter.BarName>
      <SelectMember.Provider
        mode="single"
        value={user || ''}
        onValueChange={(value) => {
          setUser(String(value || ''));
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="user">
              <SelectMember.Value />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectMember.Content />
          </Combobox.Content>
        </Popover>
      </SelectMember.Provider>
    </Filter.BarItem>
  );
};

const MSDynamicSyncHistoryDateFilterBarItem = () => {
  return (
    <Filter.BarItem queryKey="dateRange">
      <Filter.BarName>
        <IconCalendar />
        Date Range
      </Filter.BarName>
      <Filter.Date filterKey="dateRange" />
    </Filter.BarItem>
  );
};

const MSDynamicSyncHistoryTextFilterBarItem = ({
  field,
  value,
}: {
  field: SyncHistoryFilterField;
  value?: string;
}) => {
  const { Icon, key, label } = field;

  return (
    <Filter.BarItem queryKey={key}>
      <Filter.BarName>
        <Icon />
        {label}
      </Filter.BarName>
      <Filter.BarButton filterKey={key} inDialog>
        {value}
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

export const MSDynamicSyncHistoryFilterBar = () => {
  const [filterValues] = useMultiQueryState<SyncHistoryFilterValues>(
    SYNC_HISTORY_FILTER_KEYS,
  );

  return (
    <Filter.Bar>
      <MSDynamicSyncHistoryFilterPopover />
      <MSDynamicSyncHistoryUserFilterBarItem />
      <MSDynamicSyncHistoryDateFilterBarItem />
      {TEXT_FILTER_FIELDS.map((field) => (
        <MSDynamicSyncHistoryTextFilterBarItem
          key={field.key}
          field={field}
          value={filterValues[field.key] ?? undefined}
        />
      ))}
      <MSDynamicSyncHistoryTotalCount />
    </Filter.Bar>
  );
};
