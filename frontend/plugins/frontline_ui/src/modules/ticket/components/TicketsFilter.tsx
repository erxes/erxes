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
} from '@tabler/icons-react';
import clsx from 'clsx';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
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
  }>([
    'searchValue',
    'assignee',
    'priority',
    'statusId',
    'pipelineId',
    'state',
  ]);
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );
  const view = useAtomValue(ticketViewAtom);
  const setFetchedTickets = useSetAtom(fetchedTicketsState);

  const { searchValue, assignee, priority, statusId, pipelineId, state } =
    queries || {};

  useEffect(() => {
    setFetchedTickets([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, assignee, priority, statusId, pipelineId, state]);
  return (
    <>
      <Filter.Popover scope={TicketHotKeyScope.TicketPage}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search')}
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="assignee">
                  <IconUser />
                  {t('assignee-label')}
                </Filter.Item>
                <Filter.Item value="priority">
                  <IconAlertSquareRounded />
                  {t('priority-label')}
                </Filter.Item>
                <Filter.Item value="state">
                  <IconArchive />
                  {t('state-label')}
                </Filter.Item>
                {view === 'list' && (
                  <Filter.Item value="statusId">
                    <IconProgressCheck />
                    {t('status-label')}
                  </Filter.Item>
                )}
              </Command.List>
            </Command>
          </Filter.View>
          <SelectAssigneeTicket.FilterView />
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
              {t('search')}
            </Filter.BarName>
            <Filter.BarButton filterKey="searchValue" inDialog>
              {searchValue}
            </Filter.BarButton>
          </Filter.BarItem>
        )}

        <Filter.BarItem queryKey="priority">
          <Filter.BarName>
            <IconAlertSquareRounded />
            {t('priority-label')}
          </Filter.BarName>
          <SelectPriorityTicket.FilterBar />
        </Filter.BarItem>
        <Filter.BarItem queryKey="state">
          <Filter.BarName>
            <IconArchive />
            {t('state-label')}
          </Filter.BarName>
          <SelectStateTicket.FilterBar />
        </Filter.BarItem>
        {view === 'list' && (
          <Filter.BarItem queryKey="statusId">
            <Filter.BarName>
              <IconProgressCheck />
              {t('status-label')}
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
            {t('assignee-label')}
          </Filter.BarName>
          <SelectAssigneeTicket.FilterBar />
        </Filter.BarItem>
      </Filter.Bar>
    </Filter>
  );
};
