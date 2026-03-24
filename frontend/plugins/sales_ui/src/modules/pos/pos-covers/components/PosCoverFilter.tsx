import { IconClock, IconCalendar, IconUser } from '@tabler/icons-react';
import { SelectUsers } from './selects/SelectPosUsers';
import {
  useMultiQueryState,
  Combobox,
  Command,
  Filter,
  useQueryState,
  useFilterContext,
  Popover,
} from 'erxes-ui';
import { PosCoverTotalCount } from './PosCoverTotalCount';
import { PosCoverHotKeyScope } from '../types/path/PosCoverHotKeyScope';
import { useIsPosCoverLeadSessionKey } from '../hooks/UsePosCoverLeadSessionKey';
import { useState } from 'react';
export const PosCoverFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    pos: string;
    user: string;
    dateRange: string;
  }>(['user', 'dateRange']);
  const [user, setUser] = useQueryState<string>('user');
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );
  const { resetFilterState } = useFilterContext();
  return (
    <>
      <Filter.Popover scope={PosCoverHotKeyScope.PosCoverPage}>
        <Filter.Trigger isFiltered={hasFilters}>Filter</Filter.Trigger>
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="user">
                  <IconUser />
                  Users
                </Filter.Item>
                <Filter.Item value="dateRange">
                  <IconCalendar />
                  Date Range
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <Filter.View filterKey="user">
            <SelectUsers.Provider
              mode="single"
              value={user || ''}
              onValueChange={(value) => {
                setUser(value as any);
                resetFilterState();
              }}
            >
              <SelectUsers.Content />
            </SelectUsers.Provider>
          </Filter.View>
          <Filter.View filterKey="dateRange">
            <Filter.DateView filterKey="dateRange" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="dateRange" inDialog>
          <Filter.DialogDateView filterKey="dateRange" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const PosCoverFilter = () => {
  const { sessionKey } = useIsPosCoverLeadSessionKey();
  const [user, setUser] = useQueryState<string>('user');
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Filter id="pos-cover-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <PosCoverFilterPopover />
        <Filter.BarItem queryKey="dateRange">
          <Filter.BarName>
            <IconClock />
            Date Range
          </Filter.BarName>
          <Filter.Date filterKey="dateRange" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="user">
          <Filter.BarName>
            <IconUser />
            Users
          </Filter.BarName>
          <SelectUsers.Provider
            mode="single"
            value={user || ''}
            onValueChange={(value) => {
              setUser(value as any);
              setOpen(false);
            }}
          >
            <Popover open={open} onOpenChange={setOpen}>
              <Popover.Trigger asChild>
                <Filter.BarButton filterKey="user">
                  <SelectUsers.Value />
                </Filter.BarButton>
              </Popover.Trigger>
              <Combobox.Content>
                <SelectUsers.Content />
              </Combobox.Content>
            </Popover>
          </SelectUsers.Provider>
        </Filter.BarItem>
        <PosCoverTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
