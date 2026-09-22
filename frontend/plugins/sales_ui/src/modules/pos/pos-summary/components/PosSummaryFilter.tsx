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
import { usePosSummaryLeadSessionKey } from '../hooks/usePosSummaryLeadSessionKey';

import { PosSummaryHotKeyScope } from '../types/path/PosSummaryHotKeyScope';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectTypes } from './selects/SelectTypes';
import { SelectGroupType } from './selects/SelectGroupType';
import { SelectStatus } from './selects/SelectStatus';
import { SelectExcludeStatus } from './selects/SelectExcludeStatus';
import { PosSummaryTotalCount } from './PosSummaryTotalCount';
import { SelectCustomers } from '../components/selects/SelectCustomers';
import { SelectCompanies } from '../components/selects/SelectCompanies';
import { SelectUsers } from '../components/selects/SelectPosUsers';

export const PosSummaryFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    number: string;
    groupField: string;
    types: string;
    status: string;
    excludeStatus: string;
    paidDateRange: string;
    createdDateRange: string;
    company: string;
    user: string;
  }>([
    'number',
    'groupField',
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
  const { t } = useTranslation('sales');
  const { resetFilterState } = useFilterContext();
  return (
    <>
      <Filter.Popover scope={PosSummaryHotKeyScope.PosSummaryPage}>
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
                <SelectGroupType.FilterItem />
                <Filter.Item value="types">
                  <IconCategory />
                  {t('types')}
                </Filter.Item>
                <Filter.Item value="status">
                  <IconFlag />
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
            <SelectCustomers.Provider
              mode="single"
              value={customer || ''}
              onValueChange={(value) => {
                setCustomer(value as any);
                resetFilterState();
              }}
            >
              <SelectCustomers.Content />
            </SelectCustomers.Provider>
          </Filter.View>
          <Filter.View filterKey="company">
            <SelectCompanies.Provider
              mode="single"
              value={company || ''}
              onValueChange={(value) => {
                setCompany(value as any);
                resetFilterState();
              }}
            >
              <SelectCompanies.Content />
            </SelectCompanies.Provider>
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
          <SelectGroupType.FilterView />
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

export const PosSummaryFilter = () => {
  const [number] = useFilterQueryState<string>('number');
  const { sessionKey } = usePosSummaryLeadSessionKey();
  const [customer, setCustomer] = useQueryState<string>('customer');
  const [company, setCompany] = useQueryState<string>('company');
  const [user, setUser] = useQueryState<string>('user');
  const { t } = useTranslation('sales');
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Filter id="pos-summary-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <PosSummaryFilterPopover />
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
          <SelectCustomers.Provider
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
                  <SelectCustomers.Value />
                </Filter.BarButton>
              </Popover.Trigger>
              <Combobox.Content>
                <SelectCustomers.Content />
              </Combobox.Content>
            </Popover>
          </SelectCustomers.Provider>
        </Filter.BarItem>
        <Filter.BarItem queryKey={'company'}>
          <Filter.BarName>
            <IconBuilding />
            {t('company')}
          </Filter.BarName>
          <SelectCompanies.Provider
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
                  <SelectCompanies.Value />
                </Filter.BarButton>
              </Popover.Trigger>
              <Combobox.Content>
                <SelectCompanies.Content />
              </Combobox.Content>
            </Popover>
          </SelectCompanies.Provider>
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

        <SelectGroupType.FilterBar />
        <SelectTypes.FilterBar />
        <SelectStatus.FilterBar />
        <SelectExcludeStatus.FilterBar />
        <PosSummaryTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
