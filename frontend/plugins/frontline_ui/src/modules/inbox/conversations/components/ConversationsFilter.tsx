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
  IconAt,
  IconBuildingStore,
  IconCheck,
  IconCheckbox,
  IconInbox,
  IconLoader,
  IconSquare,
  IconUserCheck,
  IconUsersGroup,
  IconUserX,
} from '@tabler/icons-react';
import { BrandsInline, SelectMember } from 'ui-modules';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';
import { ConversationStatus } from '@/inbox/types/Conversation';
import {
  IntegrationTypeFilterBar,
  IntegrationTypeFilterItem,
  IntegrationTypeFilterView,
} from '@/integrations/components/IntegrationTypeFilter';
import { useTranslation } from 'react-i18next';
import { useConversationFilterCounts } from '@/inbox/conversations/hooks/useConversationCounts';
import {
  AutomationStatusFilterBar,
  AutomationStatusFilterItem,
  AutomationStatusFilterView,
} from '@/inbox/conversations/components/AutomationStatusFilter';
import { TAutomationStatusFilter } from '@/inbox/constants/automationStatusFilters';
import { useIntegrationInline } from '@/integrations/hooks/useIntegrations';

type ConversationFilterQueries = {
  status: ConversationStatus;
  unassigned: boolean;
  awaitingResponse: boolean;
  automationStatus: TAutomationStatusFilter;
  participated: boolean;
  channelId: string;
  integrationId: string;
  integrationType: string;
  brandId: string;
  created: string;
  searchValue: string;
};

type ConversationFilterQueryValues = {
  [Key in keyof ConversationFilterQueries]:
    | ConversationFilterQueries[Key]
    | null;
};

type ConversationFilterCounts = {
  unresolved?: number;
  resolved?: number;
  unassigned?: number;
  participating?: number;
  awaitingResponse?: number;
  responded?: number;
  standby?: number;
  handoff?: number;
};

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

const ConversationFilterCommandItem = ({
  children,
  count,
  loading,
  selected,
  onSelect,
}: {
  children: React.ReactNode;
  count?: number;
  loading: boolean;
  selected: boolean;
  onSelect: () => void;
}) => (
  <Filter.CommandItem onSelect={onSelect}>
    {children}
    <span className="ml-auto flex items-center gap-2">
      <FilterCount count={count} loading={loading} />
      {selected && <IconCheck />}
    </span>
  </Filter.CommandItem>
);

const ConversationFilterCommand = ({
  counts,
  loading,
  queries,
  setQueries,
}: {
  counts?: ConversationFilterCounts;
  loading: boolean;
  queries: ConversationFilterQueryValues;
  setQueries: (values: Partial<ConversationFilterQueryValues>) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { status, unassigned, awaitingResponse, participated } = queries;

  return (
    <Command>
      <Filter.CommandInput
        placeholder={t('filter')}
        variant="secondary"
        className="bg-background"
      />
      <Command.List className="max-h-none">
        <Filter.SearchValueTrigger />
        <Command.Separator className="my-1" />
        <ConversationFilterCommandItem
          count={counts?.unresolved}
          loading={loading}
          selected={status === null}
          onSelect={() => setQueries({ status: null })}
        >
          <IconSquare />
          {t('unresolved')}
        </ConversationFilterCommandItem>
        <ConversationFilterCommandItem
          count={counts?.resolved}
          loading={loading}
          selected={status === ConversationStatus.CLOSED}
          onSelect={() => setQueries({ status: ConversationStatus.CLOSED })}
        >
          <IconCheckbox />
          {t('resolved')}
        </ConversationFilterCommandItem>
        <Command.Separator className="my-1" />
        <ConversationFilterCommandItem
          count={counts?.unassigned}
          loading={loading}
          selected={Boolean(unassigned)}
          onSelect={() => setQueries({ unassigned: unassigned ? null : true })}
        >
          <IconUserX />
          {t('unassigned')}
        </ConversationFilterCommandItem>
        <ConversationFilterCommandItem
          count={counts?.participating}
          loading={loading}
          selected={Boolean(participated)}
          onSelect={() =>
            setQueries({ participated: participated ? null : true })
          }
        >
          <IconUsersGroup />
          {t('participated')}
        </ConversationFilterCommandItem>
        <Command.Separator className="my-1" />
        <ConversationFilterCommandItem
          count={counts?.awaitingResponse}
          loading={loading}
          selected={Boolean(awaitingResponse)}
          onSelect={() =>
            setQueries({
              awaitingResponse: awaitingResponse ? null : true,
            })
          }
        >
          <IconLoader />
          {t('awaiting-response')}
        </ConversationFilterCommandItem>
        <AutomationStatusFilterItem />
        <SelectChannel.FilterItem />
        <IntegrationTypeFilterItem />
        <Command.Separator className="my-1" />
        <Filter.Item value="created">
          <IconCalendarPlus />
          {t('created-at')}
        </Filter.Item>
      </Command.List>
    </Command>
  );
};

export const FilterConversationsPopover = () => {
  const [queries, setQueries] = useMultiQueryState<ConversationFilterQueries>([
    'status',
    'unassigned',
    'awaitingResponse',
    'automationStatus',
    'participated',
    'channelId',
    'integrationId',
    'integrationType',
    'brandId',
    'created',
    'searchValue',
  ]);
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
          <ConversationFilterCommand
            counts={counts}
            loading={loading}
            queries={queries}
            setQueries={setQueries}
          />
        </Filter.View>
        <SelectMember.FilterView
          onValueChange={() => setQueries({ unassigned: null })}
        />
        <SelectChannel.FilterView />
        <AutomationStatusFilterView counts={counts} loading={loading} />
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
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [status] = useQueryState<ConversationStatus>('status');
  const filterStates = useNonNullMultiQueryState<{
    status: ConversationStatus;
    unassigned: boolean;
    awaitingResponse: boolean;
    automationStatus: TAutomationStatusFilter;
    participated: boolean;
    participating: boolean;
    mentioned: boolean;
    created: Date;
    channelId: string;
    integrationId: string;
    integrationType: string;
    brandId: string;
    searchValue: string;
  }>([
    'status',
    'unassigned',
    'awaitingResponse',
    'automationStatus',
    'participated',
    'participating',
    'mentioned',
    'created',
    'channelId',
    'integrationId',
    'integrationType',
    'brandId',
    'searchValue',
  ]);

  if (Object.values(filterStates).length === 0) {
    return null;
  }

  return (
    <Filter.Bar
      className={cn(
        'hide-scroll min-w-0 flex-nowrap overflow-x-auto overflow-y-hidden [&>div]:min-w-0 [&>div]:max-w-full [&>div]:shrink-0 [&>div]:overflow-hidden [&>div>button]:min-w-0 [&>div>button]:truncate [&>div>button:last-child]:shrink-0',
        className,
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
      <Filter.BarItem queryKey="participating">
        <Filter.BarName>
          <IconUserCheck />
          {t('assigned-to-me')}
        </Filter.BarName>
      </Filter.BarItem>
      <Filter.BarItem queryKey="mentioned">
        <Filter.BarName>
          <IconAt />
          {t('mentions', { defaultValue: 'Mentions' })}
        </Filter.BarName>
      </Filter.BarItem>
      <AutomationStatusFilterBar iconOnly />
      <SelectChannel.FilterBar iconOnly />
      <IntegrationTypeFilterBar iconOnly />
      <IntegrationFilterBar />
      <BrandFilterBar />
      {children}
    </Filter.Bar>
  );
};

const IntegrationFilterBar = () => {
  const { t } = useTranslation('frontline');
  const [integrationId] = useQueryState<string>('integrationId');
  const integrationIds = integrationId?.split(',').filter(Boolean) ?? [];
  const { integration, loading } = useIntegrationInline({
    variables: { _id: integrationIds[0] || '' },
    skip: integrationIds.length !== 1,
  });

  if (!integrationId) {
    return null;
  }

  const label =
    integrationIds.length > 1
      ? t('selected-integrations', {
          count: integrationIds.length,
          defaultValue: '{{count}} integrations',
        })
      : integration?.name || integration?.kind || t('integration');

  return (
    <Filter.BarItem queryKey="integrationId">
      <Filter.BarName>
        <IconInbox />
        {loading ? <Skeleton className="h-4 w-20" /> : label}
      </Filter.BarName>
    </Filter.BarItem>
  );
};

const BrandFilterBar = () => {
  const [brandId] = useQueryState<string>('brandId');

  if (!brandId) {
    return null;
  }

  return (
    <Filter.BarItem queryKey="brandId">
      <Filter.BarName>
        <IconBuildingStore />
        <BrandsInline brandIds={[brandId]} placeholder={brandId} />
      </Filter.BarName>
    </Filter.BarItem>
  );
};
