import {
  IconClock,
  IconCashRegister,
  IconCalendar,
  IconUser,
} from '@tabler/icons-react';
import { SelectMember } from 'ui-modules';
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
import { SelectPos } from './selects/SelectPos';
import { useIsPosCoverLeadSessionKey } from '../hooks/UsePosCoverLeadSessionKey';
import { useState } from 'react';
export const PosCoverFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    pos: string;
    user: string;
    dateRange: string;
  }>(['pos', 'user', 'dateRange']);
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
                <Filter.Item value="pos">
                  <IconCashRegister />
                  POS
                </Filter.Item>
                <Filter.Item value="user">
                  <IconUser />
                  Assign to
                </Filter.Item>
                <Filter.Item value="dateRange">
                  <IconCalendar />
                  Date Range
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <Filter.View filterKey="user">
            <SelectMember.Provider
              mode="single"
              value={user || ''}
              onValueChange={(value) => {
                setUser(value as any);
                resetFilterState();
              }}
            >
              <SelectMember.Content />
            </SelectMember.Provider>
          </Filter.View>

          <Filter.View filterKey="pos">
            <SelectPos.FilterView />
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
        <SelectPos.FilterBar />
        <Filter.BarItem queryKey="user">
          <Filter.BarName>
            <IconUser />
            Assign To
          </Filter.BarName>
          <SelectMember.Provider
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
                  <SelectMember.Value />
                </Filter.BarButton>
              </Popover.Trigger>
              <Combobox.Content>
                <SelectMember.Content />
              </Combobox.Content>
            </Popover>
          </SelectMember.Provider>
        </Filter.BarItem>
        <PosCoverTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
