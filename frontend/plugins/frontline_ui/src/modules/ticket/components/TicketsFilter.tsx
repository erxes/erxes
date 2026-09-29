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
  IconCalendarBolt,
  IconCalendarX,
  IconCalendarClock,
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
    createdStartDate: string;
    startDateStartDate: string;
    targetDateStartDate: string;
    statusChangedStartDate: string;
  }>([
    'searchValue',
    'assignee',
    'priority',
    'statusId',
    'pipelineId',
    'state',
    'segments',
    'createdStartDate',
    'startDateStartDate',
    'targetDateStartDate',
    'statusChangedStartDate',
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
    createdStartDate,
    startDateStartDate,
    targetDateStartDate,
    statusChangedStartDate,
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
    createdStartDate,
    startDateStartDate,
    targetDateStartDate,
    statusChangedStartDate,
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
                <Filter.Item value="createdStartDate">
                  <IconCalendarPlus />
                  {t('created-at-label', 'Date created')}
                </Filter.Item>
                <Filter.Item value="startDateStartDate">
                  <IconCalendarBolt />
                  {t('start-date-label', 'Start date')}
                </Filter.Item>
                <Filter.Item value="targetDateStartDate">
                  <IconCalendarX />
                  {t('due-date-label', 'Due date')}
                </Filter.Item>
                <Filter.Item value="statusChangedStartDate">
                  <IconCalendarClock />
                  {t('status-changed-date', 'Status changed date')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectAssigneeTicket.FilterView />
          <SelectPriorityTicket.FilterView />
          <SelectStateTicket.FilterView />
          <SegmentsFilter.View contentType="frontline:tickets.tickets" />
          <Filter.View filterKey="createdStartDate">
            <Filter.DateView
              filterKey="createdStartDate"
              label={t('created-at-label', 'Date created')}
            />
          </Filter.View>
          <Filter.View filterKey="startDateStartDate">
            <Filter.DateView
              filterKey="startDateStartDate"
              label={t('start-date-label', 'Start date')}
            />
          </Filter.View>
          <Filter.View filterKey="targetDateStartDate">
            <Filter.DateView
              filterKey="targetDateStartDate"
              label={t('due-date-label', 'Due date')}
            />
          </Filter.View>
          <Filter.View filterKey="statusChangedStartDate">
            <Filter.DateView
              filterKey="statusChangedStartDate"
              label={t('status-changed-date', 'Status changed date')}
            />
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
        <Filter.View filterKey="createdStartDate" inDialog>
          <Filter.DialogDateView
            filterKey="createdStartDate"
            label={t('created-at-label', 'Date created')}
          />
        </Filter.View>
        <Filter.View filterKey="startDateStartDate" inDialog>
          <Filter.DialogDateView
            filterKey="startDateStartDate"
            label={t('start-date-label', 'Start date')}
          />
        </Filter.View>
        <Filter.View filterKey="targetDateStartDate" inDialog>
          <Filter.DialogDateView
            filterKey="targetDateStartDate"
            label={t('due-date-label', 'Due date')}
          />
        </Filter.View>
        <Filter.View filterKey="statusChangedStartDate" inDialog>
          <Filter.DialogDateView
            filterKey="statusChangedStartDate"
            label={t('status-changed-date', 'Status changed date')}
          />
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
        <Filter.BarItem queryKey="createdStartDate">
          <Filter.BarName>
            <IconCalendarPlus />
            {t('created-at-label', 'Date created')}
          </Filter.BarName>
          <Filter.Date
            filterKey="createdStartDate"
            label={t('created-at-label', 'Date created')}
          />
        </Filter.BarItem>
        <Filter.BarItem queryKey="startDateStartDate">
          <Filter.BarName>
            <IconCalendarBolt />
            {t('start-date-label', 'Start date')}
          </Filter.BarName>
          <Filter.Date
            filterKey="startDateStartDate"
            label={t('start-date-label', 'Start date')}
          />
        </Filter.BarItem>
        <Filter.BarItem queryKey="targetDateStartDate">
          <Filter.BarName>
            <IconCalendarX />
            {t('due-date-label', 'Due date')}
          </Filter.BarName>
          <Filter.Date
            filterKey="targetDateStartDate"
            label={t('due-date-label', 'Due date')}
          />
        </Filter.BarItem>
        <Filter.BarItem queryKey="statusChangedStartDate">
          <Filter.BarName>
            <IconCalendarClock />
            {t('status-changed-date', 'Status changed date')}
          </Filter.BarName>
          <Filter.Date
            filterKey="statusChangedStartDate"
            label={t('status-changed-date', 'Status changed date')}
          />
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
