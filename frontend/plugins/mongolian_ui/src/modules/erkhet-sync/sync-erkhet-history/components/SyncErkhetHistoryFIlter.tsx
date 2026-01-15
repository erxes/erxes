import {
  IconCalendar,
  IconTag,
  IconHash,
  IconDownload,
  IconUpload,
  IconExchange,
  IconAlertTriangle,
  IconUser,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterQueryState,
  useFilterContext,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { SyncHistoryHotKeyScope } from '../types/SyncHistoryHotKeyScope';
import { useSyncErkhetHistoryLeadSessionKey } from '../hooks/useSyncErkhetHistoryLeadSessionKey';
import { SelectMember } from 'ui-modules';
import { SyncErkhetHistoryTotalCount } from './SyncErkhetHistoryTotalCount';
import { useState } from 'react';

export const SyncErkhetHistoryFilterPopover = () => {
  const [user, setUser] = useQueryState<string>('user');
  const [queries] = useMultiQueryState<{
    user: string;
    dateRange: string;
    contentType: string;
    contentId: string;
    searchConsume: string;
    searchSend: string;
    searchResponse: string;
    searchError: string;
  }>([
    'user',
    'dateRange',
    'contentType',
    'contentId',
    'searchConsume',
    'searchSend',
    'searchResponse',
    'searchError',
  ]);
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );
  const { resetFilterState } = useFilterContext();
  return (
    <>
      <Filter.Popover scope={SyncHistoryHotKeyScope.SyncHistoryPage}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />

              <Command.List className="p-1">
                <Filter.Item value="user">
                  <IconUser />
                  Assigned To
                </Filter.Item>
                <Filter.Item value="dateRange">
                  <IconCalendar />
                  Date Range
                </Filter.Item>
                <Filter.Item value="contentType" inDialog>
                  <IconTag />
                  Content Type
                </Filter.Item>
                <Filter.Item value="contentId" inDialog>
                  <IconHash />
                  Content ID
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="searchConsume" inDialog>
                  <IconDownload />
                  Search Consume
                </Filter.Item>
                <Filter.Item value="searchSend" inDialog>
                  <IconUpload />
                  Search Send
                </Filter.Item>
                <Filter.Item value="searchResponse" inDialog>
                  <IconExchange />
                  Search Response
                </Filter.Item>
                <Filter.Item value="searchError" inDialog>
                  <IconAlertTriangle />
                  Search Error
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <Filter.View filterKey="dateRange">
            <Filter.DateView filterKey="dateRange" />
          </Filter.View>
          <Filter.View filterKey="user">
            <SelectMember.Provider
              mode="single"
              value={user || ''}
              onValueChange={(value) => {
                setUser(value as any);
                resetFilterState();
              }}
            >
              <SelectMember.Content />
            </SelectMember.Provider>
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="dateRange" inDialog>
          <Filter.DialogDateView filterKey="dateRange" />
        </Filter.View>
        <Filter.View filterKey="contentType" inDialog>
          <Filter.DialogStringView filterKey="contentType" />
        </Filter.View>
        <Filter.View filterKey="contentId" inDialog>
          <Filter.DialogStringView filterKey="contentId" />
        </Filter.View>
        <Filter.View filterKey="searchConsume" inDialog>
          <Filter.DialogStringView filterKey="searchConsume" />
        </Filter.View>
        <Filter.View filterKey="searchSend" inDialog>
          <Filter.DialogStringView filterKey="searchSend" />
        </Filter.View>
        <Filter.View filterKey="searchResponse" inDialog>
          <Filter.DialogStringView filterKey="searchResponse" />
        </Filter.View>
        <Filter.View filterKey="searchError" inDialog>
          <Filter.DialogStringView filterKey="searchError" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const SyncErkhetHistoryFilter = () => {
  const [user, setUser] = useQueryState<string>('user');
  const [contentType] = useFilterQueryState<string>('contentType');
  const [contentId] = useFilterQueryState<string>('contentId');
  const [searchConsume] = useFilterQueryState<string>('searchConsume');
  const [searchSend] = useFilterQueryState<string>('searchSend');
  const [searchResponse] = useFilterQueryState<string>('searchResponse');
  const [searchError] = useFilterQueryState<string>('searchError');
  const { sessionKey } = useSyncErkhetHistoryLeadSessionKey();
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Filter id="sync-erkhet-history-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <SyncErkhetHistoryFilterPopover />
        <Filter.BarItem queryKey="user">
          <Filter.BarName>
            <IconUser />
            Assigned To
          </Filter.BarName>
          <SelectMember.Provider
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
                  <SelectMember.Value />
                </Filter.BarButton>
              </Popover.Trigger>
              <Combobox.Content>
                <SelectMember.Content />
              </Combobox.Content>
            </Popover>
          </SelectMember.Provider>
        </Filter.BarItem>
        <Filter.BarItem queryKey="dateRange">
          <Filter.BarName>
            <IconCalendar />
            Date Range
          </Filter.BarName>
          <Filter.Date filterKey="dateRange" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="contentType">
          <Filter.BarName>
            <IconTag />
            Content Type
          </Filter.BarName>
          <Filter.BarButton filterKey="contentType" inDialog>
            {contentType}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="contentId">
          <Filter.BarName>
            <IconHash />
            Content ID
          </Filter.BarName>
          <Filter.BarButton filterKey="contentId" inDialog>
            {contentId}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="searchConsume">
          <Filter.BarName>
            <IconDownload />
            Search Consume
          </Filter.BarName>
          <Filter.BarButton filterKey="searchConsume" inDialog>
            {searchConsume}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="searchSend">
          <Filter.BarName>
            <IconUpload />
            Search Send
          </Filter.BarName>
          <Filter.BarButton filterKey="searchSend" inDialog>
            {searchSend}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="searchResponse">
          <Filter.BarName>
            <IconExchange />
            Search Response
          </Filter.BarName>
          <Filter.BarButton filterKey="searchResponse" inDialog>
            {searchResponse}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="searchError">
          <Filter.BarName>
            <IconAlertTriangle />
            Search Error
          </Filter.BarName>
          <Filter.BarButton filterKey="searchError" inDialog>
            {searchError}
          </Filter.BarButton>
        </Filter.BarItem>

        <SyncErkhetHistoryTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
