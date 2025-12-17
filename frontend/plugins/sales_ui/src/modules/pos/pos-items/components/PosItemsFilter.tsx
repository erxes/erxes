import {
  IconHash,
  IconCalendar,
  IconClock,
  IconCashRegister,
  IconUser,
  IconCategory,
  IconFlag,
  IconX,
  IconBuilding,
} from '@tabler/icons-react';
import { SelectCustomer, SelectMember, SelectCompany } from 'ui-modules';
import {
  useMultiQueryState,
  useFilterQueryState,
  Combobox,
  Command,
  Filter,
  useQueryState,
  useFilterContext,
  Popover,
} from 'erxes-ui';
import { usePosItemsLeadSessionKey } from '../hooks/usePosItemsLeadSessionKey';

import { PosItemsHotKeyScope } from '../types/path/PosItemsHotKeyScope';
import { useState } from 'react';
import { SelectPos } from './selects/SelectPos';
import { SelectTypes } from './selects/SelectTypes';
import { SelectStatus } from './selects/SelectStatus';
import { SelectExcludeStatus } from './selects/SelectExcludeStatus';
import { PosItemsTotalCount } from './PosItemsTotalCount';

export const PosItemsFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    number: string;
    pos: string;
    types: string;
    status: string;
    excludeStatus: string;
    paidDateRange: string;
    createdDateRange: string;
    company: string;
    user: string;
  }>([
    'number',
    'pos',
    'types',
    'status',
    'paidDateRange',
    'createdDateRange',
    'excludeStatus',
    'company',
    'user',
  ]);
  const [customer, setCustomer] = useQueryState<string>('customer');
  const [company, setCompany] = useQueryState<string>('company');
  const [user, setUser] = useQueryState<string>('user');
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );
  const { resetFilterState } = useFilterContext();
  return (
    <>
      <Filter.Popover scope={PosItemsHotKeyScope.PosItemsPage}>
        <Filter.Trigger isFiltered={hasFilters}>Filter</Filter.Trigger>
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1 max-h-none">
                <Filter.Item value="number" inDialog>
                  <IconHash />
                  Number
                </Filter.Item>
                <Filter.Item value="customer">
                  <IconCashRegister />
                  Customer
                </Filter.Item>
                <Filter.Item value="company">
                  <IconBuilding />
                  Company
                </Filter.Item>
                <Filter.Item value="user">
                  <IconUser />
                  Assign to
                </Filter.Item>
                <Filter.Item value="pos">
                  <IconCashRegister />
                  POS
                </Filter.Item>
                <Filter.Item value="types">
                  <IconCategory />
                  Types
                </Filter.Item>
                <Filter.Item value="status">
                  <IconFlag />
                  Status
                </Filter.Item>
                <Filter.Item value="excludeStatus">
                  <IconX />
                  Exclude Status
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="createdDateRange">
                  <IconClock />
                  Created Date Range
                </Filter.Item>
                <Filter.Item value="paidDateRange">
                  <IconCalendar />
                  Paid Date Range
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <Filter.View filterKey="customer">
            <SelectCustomer.Provider
              mode="single"
              value={customer || ''}
              onValueChange={(value) => {
                setCustomer(value as any);
                resetFilterState();
              }}
            >
              <SelectCustomer.Content />
            </SelectCustomer.Provider>
          </Filter.View>
          <Filter.View filterKey="company">
            <SelectCompany.Provider
              mode="single"
              value={company || ''}
              onValueChange={(value) => {
                setCompany(value as any);
                resetFilterState();
              }}
            >
              <SelectCompany.Content />
            </SelectCompany.Provider>
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
          <Filter.View filterKey="types">
            <SelectTypes.FilterView />
          </Filter.View>
          <Filter.View filterKey="status">
            <SelectStatus.FilterView />
          </Filter.View>
          <Filter.View filterKey="excludeStatus">
            <SelectExcludeStatus.FilterView />
          </Filter.View>
          <Filter.View filterKey="createdDateRange">
            <Filter.DateView filterKey="createdDateRange" />
          </Filter.View>
          <Filter.View filterKey="paidDateRange">
            <Filter.DateView filterKey="paidDateRange" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="number" inDialog>
          <Filter.DialogStringView filterKey="number" />
        </Filter.View>
        <Filter.View filterKey="createdDateRange" inDialog>
          <Filter.DialogDateView filterKey="createdDateRange" />
        </Filter.View>
        <Filter.View filterKey="paidDateRange" inDialog>
          <Filter.DialogDateView filterKey="paidDateRange" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const PosItemsFilter = () => {
  const [number] = useFilterQueryState<string>('number');
  const { sessionKey } = usePosItemsLeadSessionKey();
  const [customer, setCustomer] = useQueryState<string>('customer');
  const [company, setCompany] = useQueryState<string>('company');
  const [user, setUser] = useQueryState<string>('user');
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Filter id="pos-items-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <PosItemsFilterPopover />
        <Filter.BarItem queryKey="number">
          <Filter.BarName>
            <IconHash />
            Number
          </Filter.BarName>
          <Filter.BarButton filterKey="number" inDialog>
            {number}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey={'customer'}>
          <Filter.BarName>
            <IconUser />
            Customer
          </Filter.BarName>
          <SelectCustomer.Provider
            mode="single"
            value={customer || ''}
            onValueChange={(value) => {
              setCustomer(value as string);
              setOpen(false);
            }}
          >
            <Popover open={open} onOpenChange={setOpen}>
              <Popover.Trigger asChild>
                <Filter.BarButton filterKey={'customer'}>
                  <SelectCustomer.Value />
                </Filter.BarButton>
              </Popover.Trigger>
              <Combobox.Content>
                <SelectCustomer.Content />
              </Combobox.Content>
            </Popover>
          </SelectCustomer.Provider>
        </Filter.BarItem>
        <Filter.BarItem queryKey={'company'}>
          <Filter.BarName>
            <IconBuilding />
            Company
          </Filter.BarName>
          <SelectCompany.Provider
            mode="single"
            value={company || ''}
            onValueChange={(value) => {
              setCompany(value as string);
              setOpen(false);
            }}
          >
            <Popover open={open} onOpenChange={setOpen}>
              <Popover.Trigger asChild>
                <Filter.BarButton filterKey={'company'}>
                  <SelectCompany.Value />
                </Filter.BarButton>
              </Popover.Trigger>
              <Combobox.Content>
                <SelectCompany.Content />
              </Combobox.Content>
            </Popover>
          </SelectCompany.Provider>
        </Filter.BarItem>
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
        <Filter.BarItem queryKey="createdDateRange">
          <Filter.BarName>
            <IconClock />
            Created Date Range
          </Filter.BarName>
          <Filter.Date filterKey="createdDateRange" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="paidDateRange">
          <Filter.BarName>
            <IconCalendar />
            Paid Date Range
          </Filter.BarName>
          <Filter.Date filterKey="paidDateRange" />
        </Filter.BarItem>

        <SelectPos.FilterBar />
        <SelectTypes.FilterBar />
        <SelectStatus.FilterBar />
        <SelectExcludeStatus.FilterBar />
        <PosItemsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
