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
  IconCalendarUp,
} from '@tabler/icons-react';
import clsx from 'clsx';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchedTicketsState } from '@/ticket/states/fetchedTicketState';
import { SegmentsFilter } from 'ui-modules';

const TicketsFilterPopover = () => {
  const { t } = useTranslation('frontline');
  const [queries] = useMultiQueryState<{
    searchValue: string;
    assignee: string;
    priority: string;
    statusId: string;
    pipelineId: string;
    state: string;
    segments: string[];
    created: string;
    updated: string;
  }>([
    'searchValue',
    'assignee',
    'priority',
    'statusId',
    'pipelineId',
    'state',
    'segments',
    'created',
    'updated',
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
    created,
    updated,
  } = queries || {};
  const segments = JSON.stringify(queries?.segments);

  useEffect(() => {
    setFetchedTickets([]);
  }, [
    searchValue,
    assignee,
    priority,
    statusId,
    pipelineId,
    state,
    segments,
    created,
    updated,
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
                <SegmentsFilter />
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
                {view === 'list' && (
                  <Filter.Item value="statusId">
                    <IconProgressCheck />
                    {t('status-label', 'Status')}
                  </Filter.Item>
                )}
                <Command.Separator className="my-1" />
                <Filter.Item value="created">
                  <IconCalendarPlus />
                  {t('created-at-label')}
                </Filter.Item>
                <Filter.Item value="updated">
                  <IconCalendarUp />
                  {t('updated-at-label')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectAssigneeTicket.FilterView />
          <SelectPriorityTicket.FilterView />
          <SelectStateTicket.FilterView />
          <SegmentsFilter.View contentType="frontline:tickets.tickets" />
          <Filter.View filterKey="created">
            <Filter.DateView filterKey="created" />
          </Filter.View>
          <Filter.View filterKey="updated">
            <Filter.DateView filterKey="updated" />
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
        <Filter.View filterKey="created" inDialog>
          <Filter.DialogDateView filterKey="created" />
        </Filter.View>
        <Filter.View filterKey="updated" inDialog>
          <Filter.DialogDateView filterKey="updated" />
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
        <SegmentsFilter.Bar contentType="frontline:tickets.tickets" />
        <Filter.BarItem queryKey="created">
          <Filter.BarName>
            <IconCalendarPlus />
            {t('created-at-label')}
          </Filter.BarName>
          <Filter.Date filterKey="created" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="updated">
          <Filter.BarName>
            <IconCalendarUp />
            {t('updated-at-label')}
          </Filter.BarName>
          <Filter.Date filterKey="updated" />
        </Filter.BarItem>
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
