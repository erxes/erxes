import { IconCashRegister, IconUser, IconBuilding } from '@tabler/icons-react';
import { SelectCustomer, SelectMember, SelectCompany } from 'ui-modules';
import {
  useMultiQueryState,
  Combobox,
  Command,
  Filter,
  useQueryState,
  useFilterContext,
  Popover,
} from 'erxes-ui';
import { usePosOrderBySubsLeadSessionKey } from '../hooks/usePosOrderBySubsLeadSessionKey';
import { PosOrderBySubsTotalCount } from './PosOrderBySubsTotalCount';
import { PosOrderBySubsHotKeyScope } from '../types/path/PosOrderBySubsHotKeyScope';
import { useState } from 'react';

export const PosOrderBySubsFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    customer: string;
    company: string;
    user: string;
  }>(['customer', 'company', 'user']);
  const [customer, setCustomer] = useQueryState<string>('customer');
  const [company, setCompany] = useQueryState<string>('company');
  const [user, setUser] = useQueryState<string>('user');
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );
  const { resetFilterState } = useFilterContext();
  return (
    <>
      <Filter.Popover scope={PosOrderBySubsHotKeyScope.PosOrderBySubsPage}>
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
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog></Filter.Dialog>
    </>
  );
};

export const PosOrderBySubsFilter = () => {
  const { sessionKey } = usePosOrderBySubsLeadSessionKey();
  const [customer, setCustomer] = useQueryState<string>('customer');
  const [company, setCompany] = useQueryState<string>('company');
  const [user, setUser] = useQueryState<string>('user');
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Filter id="pos-order-by-subs-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <PosOrderBySubsFilterPopover />
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
        <PosOrderBySubsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
