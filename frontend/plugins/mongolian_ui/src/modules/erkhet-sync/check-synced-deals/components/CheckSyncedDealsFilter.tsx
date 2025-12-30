import { IconCalendar, IconBuilding, IconHash } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useFilterQueryState,
  useQueryState,
} from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import { CheckSyncedDealsHotKeyScope } from '../types/CheckSyncedDealsHotKeyScope';
import { useMultiQueryState } from 'erxes-ui/hooks';
import { useCheckSyncedDealsLeadSessionKey } from '../hooks/useCheckSyncedDealsLeadSessionKey';
import { CheckSyncedDealsTotalCount } from './CheckSyncedDealsTotalCount';
import { SelectSalesBoard } from './selects/SelectBoard';
import { SelectPipeline } from './selects/SelectPipeline';
import { SelectStage } from './selects/SelectStage';
import { SelectDateType } from './selects/SelectDateType';
import { useState } from 'react';

export const CheckSyncedDealsFilterPopover = () => {
  const [boardId] = useFilterQueryState<string>('boardId');
  const [pipelineId] = useFilterQueryState<string>('pipelineId');
  const [user, setUser] = useQueryState<string>('user');
  const [queries] = useMultiQueryState<{
    boardId: string;
    pipelineId: string;
    stageId: string;
    user: string;
    dealSearch: string;
    number: string;
    stageChangedDateRange: string;
    dateType: string;
    dateRange: string;
  }>([
    'user',
    'boardId',
    'pipelineId',
    'stageId',
    'dealSearch',
    'number',
    'stageChangedDateRange',
    'dateType',
    'dateRange',
  ]);
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );
  const { resetFilterState } = useFilterContext();
  return (
    <>
      <Filter.Popover scope={CheckSyncedDealsHotKeyScope.CheckSyncedDealsPage}>
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
                <SelectSalesBoard.FilterItem />
                <SelectPipeline.FilterItem />
                <SelectStage.FilterItem />
                <SelectMember.FilterItem value="user" label="Assigned To" />
                <Command.Separator className="my-1" />
                <Filter.Item value="dealSearch" inDialog>
                  <IconBuilding />
                  Deal Search
                </Filter.Item>
                <Filter.Item value="number" inDialog>
                  <IconHash />
                  Number
                </Filter.Item>
                <Filter.Item value="dateRange">
                  <IconCalendar />
                  Date range
                </Filter.Item>
                <SelectDateType.FilterItem />
              </Command.List>
            </Command>
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
          <SelectSalesBoard.FilterView />
          <SelectPipeline.FilterView boardId={boardId || undefined} />
          <SelectStage.FilterView pipelineId={pipelineId || undefined} />
          <SelectDateType.FilterView />
          <Filter.View filterKey="dateRange">
            <Filter.DateView filterKey="dateRange" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="dealSearch" inDialog>
          <Filter.DialogStringView filterKey="dealSearch" />
        </Filter.View>
        <Filter.View filterKey="number" inDialog>
          <Filter.DialogStringView filterKey="number" />
        </Filter.View>
        <Filter.View filterKey="stageChangedDateRange" inDialog>
          <Filter.DialogStringView filterKey="stageChangedDateRange" />
        </Filter.View>
        <Filter.View filterKey="dateRange" inDialog>
          <Filter.DialogDateView filterKey="dateRange" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const CheckSyncedDealsFilter = () => {
  const [boardId] = useFilterQueryState<string>('boardId');
  const [number] = useFilterQueryState<string>('number');
  const [dealSearch] = useFilterQueryState<string>('dealSearch');
  const [pipelineId] = useFilterQueryState<string>('pipelineId');
  const [user, setUser] = useQueryState<string>('user');
  const [open, setOpen] = useState<boolean>(false);
  const { sessionKey } = useCheckSyncedDealsLeadSessionKey();

  return (
    <Filter id="sync-erkhet-history-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <CheckSyncedDealsFilterPopover />
        <Filter.BarItem queryKey="dealSearch">
          <Filter.BarName>
            <IconBuilding />
            Deal search
          </Filter.BarName>
          <Filter.BarButton filterKey="dealSearch" inDialog>
            {dealSearch}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="number">
          <Filter.BarName>
            <IconHash />
            Number
          </Filter.BarName>
          <Filter.BarButton filterKey="number" inDialog>
            {number}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="dateRange">
          <Filter.BarName>
            <IconCalendar />
            Date range
          </Filter.BarName>
          <Filter.Date filterKey="dateRange" />
        </Filter.BarItem>

        <SelectSalesBoard.FilterBar />
        <SelectPipeline.FilterBar boardId={boardId || undefined} />
        <SelectStage.FilterBar pipelineId={pipelineId || undefined} />
        <Filter.BarItem queryKey="user">
          <Filter.BarName>Assigned To</Filter.BarName>
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
        <SelectDateType.FilterBar />
        <CheckSyncedDealsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
