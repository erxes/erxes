import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectStateTicket } from '@/ticket/components/ticket-selects/SelectStateTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { TicketHotKeyScope } from '@/ticket/types';
import { TicketsTotalCount } from '@/ticket/components/TicketsTotalCount';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { TICKETS_CURSOR_SESSION_KEY } from '@/ticket/constants';
import { ticketViewAtom } from '@/ticket/states/ticketViewState';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  IconAlertSquareRounded,
  IconProgressCheck,
  IconSearch,
  IconUser,
  IconArchive,
  IconCalendar,
} from '@tabler/icons-react';
import clsx from 'clsx';
import {
  Combobox,
  Command,
  Filter,
  useMultiQueryState,
  useRecordTableCursor,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectCompany, SelectCustomer, SelectMember } from 'ui-modules';
import { fetchedTicketsState } from '@/ticket/states/fetchedTicketState';

const TicketsFilterPopover = () => {
  const { t } = useTranslation('frontline');
  const [queries] = useMultiQueryState<{
    searchValue: string;
    assignee: string;
    priority: string;
    statusId: string;
    pipelineId: string;
    state: string;
    createdBy: string;
    customer: string;
    company: string;
    createdAt: string;
  }>([
    'searchValue',
    'assignee',
    'priority',
    'statusId',
    'pipelineId',
    'state',
    'company',
    'createdBy',
    'customer',
    'createdAt',
  ]);
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );
  const view = useAtomValue(ticketViewAtom);
  const setFetchedTickets = useSetAtom(fetchedTicketsState);
  const { setCursor } = useRecordTableCursor({
    sessionKey: TICKETS_CURSOR_SESSION_KEY,
  });

  const {
    searchValue,
    assignee,
    priority,
    statusId,
    pipelineId,
    state,
    createdBy,
    createdAt,
    customer,
    company,
  } = queries || {};

  useEffect(() => {
    setFetchedTickets([]);
    setCursor('');
  }, [
    searchValue,
    assignee,
    priority,
    statusId,
    pipelineId,
    state,
    createdBy,
    createdAt,
    customer,
    company,
    setCursor,
    setFetchedTickets,
  ]);
  return (
    <>
      <Filter.Popover scope={TicketHotKeyScope.TicketPage}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter', 'Filter...')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search', 'Search')}
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="assignee">
                  <IconUser />
                  {t('assignee-label', 'Assignee')}
                </Filter.Item>
                <Filter.Item value="priority">
                  <IconAlertSquareRounded />
                  {t('priority-label', 'Priority')}
                </Filter.Item>
                <Filter.Item value="state">
                  <IconArchive />
                  {t('state-label', 'State')}
                </Filter.Item>
                <SelectMember.FilterItem
                  value="createdBy"
                  label={t('created-by', 'Created by')}
                />
                <Filter.Item value="createdAt">
                  <IconCalendar />
                  {t('created-at', 'Created at')}
                </Filter.Item>
                <SelectCustomer.FilterItem
                  value="customer"
                  label={t('customer-label', 'Customer')}
                />
                <SelectCompany.FilterItem
                  value="company"
                  label={t('company-label', 'Company')}
                />
                {view === 'list' && (
                  <Filter.Item value="statusId">
                    <IconProgressCheck />
                    {t('status-label', 'Status')}
                  </Filter.Item>
                )}
              </Command.List>
            </Command>
          </Filter.View>
          <SelectAssigneeTicket.FilterView />
          <SelectPriorityTicket.FilterView />
          <SelectStateTicket.FilterView />
          <SelectMember.FilterView queryKey="createdBy" mode="single" />
          <SelectCustomer.FilterView filterKey="customer" mode="single" />
          <SelectCompany.FilterView filterKey="company" mode="single" />
          <Filter.View filterKey="createdAt">
            <Filter.DateView filterKey="createdAt" />
          </Filter.View>
          {view === 'list' && (
            <SelectStatusTicket.FilterView
              pipelineId={queries?.pipelineId || ''}
            />
          )}
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
        <Filter.View filterKey="createdAt" inDialog>
          <Filter.DialogDateView filterKey="createdAt" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const TicketsFilter = () => {
  const { t } = useTranslation('frontline');
  const [queries] = useMultiQueryState<{
    searchValue: string;
    assignee: string;
    priority: string;
    statusId: string;
    pipelineId: string;
    state: string;
  }>([
    'searchValue',
    'assignee',
    'priority',
    'statusId',
    'pipelineId',
    'state',
  ]);
  const { searchValue } = queries || {};
  const view = useAtomValue(ticketViewAtom);
  return (
    <Filter id="Tickets-filter" sessionKey={TICKETS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <TicketsFilterPopover />
        <TicketsTotalCount />
        {searchValue && (
          <Filter.BarItem queryKey="searchValue">
            <Filter.BarName>
              <IconSearch />
              {t('search', 'Search')}
            </Filter.BarName>
            <Filter.BarButton filterKey="searchValue" inDialog>
              {searchValue}
            </Filter.BarButton>
          </Filter.BarItem>
        )}

        <Filter.BarItem queryKey="priority">
          <Filter.BarName>
            <IconAlertSquareRounded />
            {t('priority-label', 'Priority')}
          </Filter.BarName>
          <SelectPriorityTicket.FilterBar />
        </Filter.BarItem>
        <Filter.BarItem queryKey="state">
          <Filter.BarName>
            <IconArchive />
            {t('state-label', 'State')}
          </Filter.BarName>
          <SelectStateTicket.FilterBar />
        </Filter.BarItem>
        {view === 'list' && (
          <Filter.BarItem queryKey="statusId">
            <Filter.BarName>
              <IconProgressCheck />
              {t('status-label', 'Status')}
            </Filter.BarName>
            <SelectStatusTicket.FilterBar
              pipelineId={queries?.pipelineId || ''}
              scope={clsx(TicketHotKeyScope.TicketPage, 'filter', 'Status')}
            />
          </Filter.BarItem>
        )}
        <Filter.BarItem queryKey="assignee">
          <Filter.BarName>
            <IconUser />
            {t('assignee-label', 'Assignee')}
          </Filter.BarName>
          <SelectAssigneeTicket.FilterBar />
        </Filter.BarItem>
        <SelectMember.FilterBar
          queryKey="createdBy"
          mode="single"
          label={t('created-by', 'Created by')}
        />
        <Filter.BarItem queryKey="createdAt">
          <Filter.BarName>
            <IconCalendar />
            {t('created-at', 'Created at')}
          </Filter.BarName>
          <Filter.Date filterKey="createdAt" />
        </Filter.BarItem>
        <SelectCustomer.FilterBar
          filterKey="customer"
          mode="single"
          label={t('customer-label', 'Customer')}
        />
        <SelectCompany.FilterBar
          filterKey="company"
          mode="single"
          cursorKey={TICKETS_CURSOR_SESSION_KEY}
          label={t('company-label', 'Company')}
        />
      </Filter.Bar>
    </Filter>
  );
};
