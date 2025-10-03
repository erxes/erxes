import {
  Combobox,
  Command,
  Filter,
  useMultiQueryState,
  useNonNullMultiQueryState,
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
import { useQueryState } from 'erxes-ui';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';
import { ConversationStatus } from '@/inbox/types/Conversation';
import {
  IntegrationTypeFilterBar,
  IntegrationTypeFilterItem,
  IntegrationTypeFilterView,
} from '@/integrations/components/IntegrationTypeFilter';
import { useAtomValue } from 'jotai';
import { inboxLayoutState } from '@/inbox/states/inboxLayoutState';

export const FilterConversationsPopover = () => {
  const [queries, setQueries] = useMultiQueryState<{
    status: ConversationStatus;
    unassigned: boolean;
    awaitingResponse: boolean;
    participated: boolean;
  }>(['status', 'unassigned', 'awaitingResponse', 'participated']);
  const { status, unassigned, awaitingResponse, participated } = queries || {};

  return (
    <Filter.Popover scope={InboxHotkeyScope.MainPage}>
      <Filter.Trigger isFiltered />
      <Combobox.Content className="w-64">
        <Filter.View>
          <Command>
            <Filter.CommandInput
              placeholder="Filter"
              variant="secondary"
              className="bg-background"
            />
            <Command.List className="max-h-none">
              <Filter.CommandItem onSelect={() => setQueries({ status: null })}>
                <IconSquare />
                Unresolved
                {status === null && <IconCheck className="ml-auto" />}
              </Filter.CommandItem>
              <Filter.CommandItem
                onSelect={() =>
                  setQueries({ status: ConversationStatus.CLOSED })
                }
              >
                <IconCheckbox />
                Resolved
                {status === ConversationStatus.CLOSED && (
                  <IconCheck className="ml-auto" />
                )}
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
                Unassigned
                {unassigned && <IconCheck className="ml-auto" />}
              </Filter.CommandItem>
              <Filter.CommandItem
                onSelect={() => {
                  setQueries({
                    participated: participated ? null : true,
                  });
                }}
              >
                <IconUsersGroup />
                Participated
                {participated && <IconCheck className="ml-auto" />}
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
                Awaiting response
                {awaitingResponse && <IconCheck className="ml-auto" />}
              </Filter.CommandItem>
              <SelectChannel.FilterItem />
              <IntegrationTypeFilterItem />
              <Command.Separator className="my-1" />
              <Filter.Item value="created">
                <IconCalendarPlus />
                Created At
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
  const [status] = useQueryState<ConversationStatus>('status');
  const inboxLayout = useAtomValue(inboxLayoutState);
  const filterStates = useNonNullMultiQueryState<{
    status: ConversationStatus;
    unassigned: boolean;
    awaitingResponse: boolean;
    participated: boolean;
    created: Date;
  }>(['status', 'unassigned', 'awaitingResponse', 'participated', 'created']);

  if (Object.values(filterStates).length === 0) {
    return null;
  }

  return (
    <Filter.Bar
      className={inboxLayout === 'list' ? 'pl-2' : 'pt-1'}
      id="conversations-filter-bar"
    >
      {status === ConversationStatus.CLOSED && (
        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconCheckbox />
            Resolved
          </Filter.BarName>
        </Filter.BarItem>
      )}

      <Filter.BarItem queryKey="created">
        <Filter.Date filterKey="created" className="rounded-l" />
      </Filter.BarItem>

      <Filter.BarItem queryKey="unassigned">
        <Filter.BarName>
          <IconUserX />
          Unassigned
        </Filter.BarName>
      </Filter.BarItem>

      <Filter.BarItem queryKey="awaitingResponse">
        <Filter.BarName>
          <IconLoader />
          Awaiting response
        </Filter.BarName>
      </Filter.BarItem>

      <Filter.BarItem queryKey="participated">
        <Filter.BarName>
          <IconUsersGroup />
          Participated
        </Filter.BarName>
      </Filter.BarItem>
      <SelectChannel.FilterBar iconOnly />
      <IntegrationTypeFilterBar iconOnly />
      {children}
    </Filter.Bar>
  );
};
