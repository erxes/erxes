import {
  Combobox,
  Command,
  Filter,
  Skeleton,
  cn,
  parseDateRangeFromString,
  useMultiQueryState,
  useNonNullMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import {
  IconCalendarPlus,
  IconCheck,
  IconCheckbox,
  IconLoader,
  IconSquare,
  IconUsersGroup,
  IconUserX,
} from '@tabler/icons-react';
import { SelectMember } from 'ui-modules';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';
import { ConversationStatus } from '@/inbox/types/Conversation';
import {
  IntegrationTypeFilterBar,
  IntegrationTypeFilterItem,
  IntegrationTypeFilterView,
} from '@/integrations/components/IntegrationTypeFilter';
import { useInboxLayout } from '@/inbox/hooks/useInboxLayout';
import { useTranslation } from 'react-i18next';
import { useConversationFilterCounts } from '@/inbox/conversations/hooks/useConversationCounts';

const FilterCount = ({
  count,
  loading,
}: {
  count?: number;
  loading: boolean;
}) =>
  loading ? (
    <Skeleton className="ml-auto size-4 rounded-full" />
  ) : (
    <span className="ml-auto tabular-nums text-xs text-muted-foreground">
      {count ?? 0}
    </span>
  );

export const FilterConversationsPopover = () => {
  const { t } = useTranslation('frontline');
  const [queries, setQueries] = useMultiQueryState<{
    status: ConversationStatus;
    unassigned: boolean;
    awaitingResponse: boolean;
    participated: boolean;
    channelId: string;
    integrationId: string;
    integrationType: string;
    brandId: string;
    created: string;
    searchValue: string;
  }>([
    'status',
    'unassigned',
    'awaitingResponse',
    'participated',
    'channelId',
    'integrationId',
    'integrationType',
    'brandId',
    'created',
    'searchValue',
  ]);
  const { status, unassigned, awaitingResponse, participated } = queries || {};
  const parsedDate = parseDateRangeFromString(queries.created || '');
  const { counts, loading } = useConversationFilterCounts({
    channelId: queries.channelId,
    integrationId: queries.integrationId,
    integrationType: queries.integrationType,
    brandId: queries.brandId,
    startDate: parsedDate?.from,
    endDate: parsedDate?.to,
    searchValue: queries.searchValue,
  });

  return (
    <Filter.Popover scope={InboxHotkeyScope.MainPage}>
      <Filter.Trigger isFiltered />
      <Combobox.Content className="w-64">
        <Filter.View>
          <Command>
            <Filter.CommandInput
              placeholder={t('filter')}
              variant="secondary"
              className="bg-background"
            />
            <Command.List className="max-h-none">
              <Filter.SearchValueTrigger />
              <Command.Separator className="my-1" />
              <Filter.CommandItem onSelect={() => setQueries({ status: null })}>
                <IconSquare />
                {t('unresolved')}
                <span className="ml-auto flex items-center gap-2">
                  <FilterCount count={counts?.unresolved} loading={loading} />
                  {status === null && <IconCheck />}
                </span>
              </Filter.CommandItem>
              <Filter.CommandItem
                onSelect={() =>
                  setQueries({ status: ConversationStatus.CLOSED })
                }
              >
                <IconCheckbox />
                {t('resolved')}
                <span className="ml-auto flex items-center gap-2">
                  <FilterCount count={counts?.resolved} loading={loading} />
                  {status === ConversationStatus.CLOSED && <IconCheck />}
                </span>
              </Filter.CommandItem>
              <Command.Separator className="my-1" />
              <Filter.CommandItem
                onSelect={() => {
                  setQueries({
                    unassigned: unassigned ? null : true,
                  });
                }}
              >
                <IconUserX />
                {t('unassigned')}
                <span className="ml-auto flex items-center gap-2">
                  <FilterCount count={counts?.unassigned} loading={loading} />
                  {unassigned && <IconCheck />}
                </span>
              </Filter.CommandItem>
              <Filter.CommandItem
                onSelect={() => {
                  setQueries({
                    participated: participated ? null : true,
                  });
                }}
              >
                <IconUsersGroup />
                {t('participated')}
                <span className="ml-auto flex items-center gap-2">
                  <FilterCount count={counts?.participating} loading={loading} />
                  {participated && <IconCheck />}
                </span>
              </Filter.CommandItem>
              <Command.Separator className="my-1" />
              <Filter.CommandItem
                onSelect={() =>
                  setQueries({
                    awaitingResponse: awaitingResponse ? null : true,
                  })
                }
              >
                <IconLoader />
                {t('awaiting-response')}
                <span className="ml-auto flex items-center gap-2">
                  <FilterCount
                    count={counts?.awaitingResponse}
                    loading={loading}
                  />
                  {awaitingResponse && <IconCheck />}
                </span>
              </Filter.CommandItem>
              <SelectChannel.FilterItem />
              <IntegrationTypeFilterItem />
              <Command.Separator className="my-1" />
              <Filter.Item value="created">
                <IconCalendarPlus />
                {t('created-at')}
              </Filter.Item>
            </Command.List>
          </Command>
        </Filter.View>
        <SelectMember.FilterView
          onValueChange={() => setQueries({ unassigned: null })}
        />
        <SelectChannel.FilterView />
        <Filter.View filterKey="created">
          <Filter.DateView filterKey="created" />
        </Filter.View>
        <IntegrationTypeFilterView />
      </Combobox.Content>
    </Filter.Popover>
  );
};

export const ConversationFilterBar = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const [status] = useQueryState<ConversationStatus>('status');
  const inboxLayout = useInboxLayout();
  const filterStates = useNonNullMultiQueryState<{
    status: ConversationStatus;
    unassigned: boolean;
    awaitingResponse: boolean;
    participated: boolean;
    created: Date;
    channelId: string;
    searchValue: string;
  }>([
    'status',
    'unassigned',
    'awaitingResponse',
    'participated',
    'created',
    'channelId',
    'searchValue',
  ]);

  if (Object.values(filterStates).length === 0) {
    return null;
  }

  return (
    <Filter.Bar
      className={cn(
        'w-full min-w-0 overflow-hidden [&>div]:min-w-0 [&>div]:max-w-full [&>div]:overflow-hidden [&>div>button]:min-w-0 [&>div>button]:truncate [&>div>button:last-child]:shrink-0',
        inboxLayout === 'list' ? 'pl-2' : 'pt-1',
      )}
      id="conversations-filter-bar"
    >
      <Filter.SearchValueBarItem />
      {status === ConversationStatus.CLOSED && (
        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconCheckbox />
            {t('resolved')}
          </Filter.BarName>
        </Filter.BarItem>
      )}

      <Filter.BarItem queryKey="created">
        <Filter.Date filterKey="created" className="rounded-l" />
      </Filter.BarItem>

      <Filter.BarItem queryKey="unassigned">
        <Filter.BarName>
          <IconUserX />
          {t('unassigned')}
        </Filter.BarName>
      </Filter.BarItem>

      <Filter.BarItem queryKey="awaitingResponse">
        <Filter.BarName>
          <IconLoader />
          {t('awaiting-response')}
        </Filter.BarName>
      </Filter.BarItem>

      <Filter.BarItem queryKey="participated">
        <Filter.BarName>
          <IconUsersGroup />
          {t('participated')}
        </Filter.BarName>
      </Filter.BarItem>
      <SelectChannel.FilterBar iconOnly />
      <IntegrationTypeFilterBar iconOnly />
      {children}
    </Filter.Bar>
  );
};
