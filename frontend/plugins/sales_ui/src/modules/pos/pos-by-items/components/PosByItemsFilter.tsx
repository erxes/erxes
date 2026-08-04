import {
  IconHash,
  IconCalendar,
  IconClock,
  IconCashRegister,
  IconUser,
  IconTag,
  IconChecklist,
  IconX,
  IconBuilding,
} from '@tabler/icons-react';
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
import { usePosByItemsLeadSessionKey } from '../hooks/usePosByItemsLeadSessionKey';
import { PosByItemsTotalCount } from './PosByItemsTotalCount';
import { PosByItemsHotKeyScope } from '../types/path/PosByItemsHotKeyScope';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SelectTypes } from './selects/SelectTypes';
import { SelectStatus } from './selects/SelectStatus';
import { SelectExcludeStatus } from './selects/SelectExcludeStatus';
import { SelectUsers } from './selects/SelectPosUsers';
import { SelectCategory, SelectCompany, SelectCustomer } from 'ui-modules/modules';

export const PosByItemsFilterPopover = () => {
  const { t } = useTranslation('sales');
  const [queries] = useMultiQueryState<{
    number: string;
    types: string;
    status: string;
    excludeStatus: string;
    paidDateRange: string;
    createdDateRange: string;
    company: string;
    user: string;
    category: string;
  }>([
    'number',
    'types',
    'status',
    'paidDateRange',
    'createdDateRange',
    'excludeStatus',
    'company',
    'user',
    'category',
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
      <Filter.Popover scope={PosByItemsHotKeyScope.PosByItemsPage}>
        <Filter.Trigger isFiltered={hasFilters}>{t('filter')}</Filter.Trigger>
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1 max-h-none">
                <Filter.Item value="number" inDialog>
                  <IconHash />
                  {t('number')}
                </Filter.Item>
                <SelectCategory.FilterItem />
                <Filter.Item value="customer">
                  <IconCashRegister />
                  {t('customer')}
                </Filter.Item>
                <Filter.Item value="company">
                  <IconBuilding />
                  {t('company')}
                </Filter.Item>
                <Filter.Item value="user">
                  <IconUser />
                  {t('users')}
                </Filter.Item>
                <Filter.Item value="types">
                  <IconTag />
                  {t('types')}
                </Filter.Item>
                <Filter.Item value="status">
                  <IconChecklist />
                  {t('status')}
                </Filter.Item>
                <Filter.Item value="excludeStatus">
                  <IconX />
                  {t('exclude-status')}
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="createdDateRange">
                  <IconClock />
                  {t('created-date-range')}
                </Filter.Item>
                <Filter.Item value="paidDateRange">
                  <IconCalendar />
                  {t('paid-date-range')}
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
          <SelectCategory.FilterView />
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
        <Filter.View filterKey="category" inDialog>
          <SelectCategory.FilterView />
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

export const PosByItemsFilter = () => {
  const { t } = useTranslation('sales');
  const [number] = useFilterQueryState<string>('number');
  const { sessionKey } = usePosByItemsLeadSessionKey();
  const [customer, setCustomer] = useQueryState<string>('customer');
  const [company, setCompany] = useQueryState<string>('company');
  const [user, setUser] = useQueryState<string>('user');
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Filter id="pos-by-items-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <PosByItemsFilterPopover />
        <Filter.BarItem queryKey="number">
          <Filter.BarName>
            <IconHash />
            {t('number')}
          </Filter.BarName>
          <Filter.BarButton filterKey="number" inDialog>
            {number}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey={'customer'}>
          <Filter.BarName>
            <IconUser />
            {t('customer')}
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
            {t('company')}
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
            {t('users')}
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
        <Filter.BarItem queryKey="createdDateRange">
          <Filter.BarName>
            <IconClock />
            {t('created-date-range')}
          </Filter.BarName>
          <Filter.Date filterKey="createdDateRange" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="paidDateRange">
          <Filter.BarName>
            <IconCalendar />
            {t('paid-date-range')}
          </Filter.BarName>
          <Filter.Date filterKey="paidDateRange" />
        </Filter.BarItem>
        <SelectCategory.FilterBar />
        <SelectTypes.FilterBar />
        <SelectStatus.FilterBar />
        <SelectExcludeStatus.FilterBar />
        <PosByItemsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
