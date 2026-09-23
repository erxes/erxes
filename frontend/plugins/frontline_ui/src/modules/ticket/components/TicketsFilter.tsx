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
  IconCalendarPlus,
} from '@tabler/icons-react';
import clsx from 'clsx';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { SelectCompany, SelectCustomer, SelectMember } from 'ui-modules';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    createdAt: string;
    customerIds: string[];
    companyIds: string[];
  }>([
    'searchValue',
    'assignee',
    'priority',
    'statusId',
    'pipelineId',
    'state',
    'createdBy',
    'createdAt',
    'customerIds',
    'companyIds',
  ]);
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );
  const view = useAtomValue(ticketViewAtom);
  const setFetchedTickets = useSetAtom(fetchedTicketsState);

  const {
    searchValue,
    assignee,
    priority,
    statusId,
    pipelineId,
    state,
    createdBy,
    createdAt,
    customerIds,
    companyIds,
  } = queries || {};

  const contactFilterKey = JSON.stringify([customerIds, companyIds]);

  useEffect(() => {
    setFetchedTickets([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchValue,
    assignee,
    priority,
    statusId,
    pipelineId,
    state,
    createdBy,
    createdAt,
    contactFilterKey,
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
                <SelectMember.FilterItem
                  value="createdBy"
                  label={t('created-by', 'Created by')}
                />
                <Filter.Item value="createdAt">
                  <IconCalendarPlus />
                  {t('created-at', 'Created at')}
                </Filter.Item>
                <SelectCustomer.FilterItem
                  value="customerIds"
                  label={t('customer', 'Customer')}
                />
                <SelectCompany.FilterItem
                  value="companyIds"
                  label={t('company-label', 'Company')}
                />
                <Filter.Item value="priority">
                  <IconAlertSquareRounded />
                  {t('priority-label', 'Priority')}
                </Filter.Item>
                <Filter.Item value="state">
                  <IconArchive />
                  {t('state-label', 'State')}
                </Filter.Item>
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
          <SelectMember.FilterView queryKey="createdBy" />
          <Filter.View filterKey="createdAt">
            <Filter.DateView
              filterKey="createdAt"
              label={t('created-at', 'Created at')}
            />
          </Filter.View>
          <SelectCustomer.FilterView filterKey="customerIds" mode="multiple" />
          <SelectCompany.FilterView filterKey="companyIds" mode="multiple" />
          <SelectPriorityTicket.FilterView />
          <SelectStateTicket.FilterView />
          {view === 'list' && (
            <SelectStatusTicket.FilterView
              pipelineId={queries?.pipelineId || ''}
            />
          )}
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="createdAt" inDialog>
          <Filter.DialogDateView
            filterKey="createdAt"
            label={t('created-at', 'Created at')}
          />
        </Filter.View>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
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
    createdBy: string;
    createdAt: string;
    customerIds: string[];
    companyIds: string[];
  }>([
    'searchValue',
    'assignee',
    'priority',
    'statusId',
    'pipelineId',
    'state',
    'createdBy',
    'createdAt',
    'customerIds',
    'companyIds',
  ]);
  const { searchValue } = queries || {};
  const view = useAtomValue(ticketViewAtom);
  return (
    <Filter id="Tickets-filter" sessionKey={TICKETS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <TicketsFilterPopover />
        <TicketsTotalCount />
        <SelectMember.FilterBar
          queryKey="createdBy"
          label={t('created-by', 'Created by')}
        />
        <Filter.BarItem queryKey="createdAt">
          <Filter.BarName>
            <IconCalendarPlus />
            {t('created-at', 'Created at')}
          </Filter.BarName>
          <Filter.Date
            filterKey="createdAt"
            label={t('created-at', 'Created at')}
          />
        </Filter.BarItem>
        <SelectCustomer.FilterBar
          filterKey="customerIds"
          label={t('customer', 'Customer')}
        />
        <SelectCompany.FilterBar
          filterKey="companyIds"
          label={t('company-label', 'Company')}
        />
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
      </Filter.Bar>
    </Filter>
  );
};
