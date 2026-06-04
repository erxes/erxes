import { IconBuilding, IconCalendar, IconHash } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useFilterContext,
  useFilterQueryState,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import { AccountingCheckSyncedDealRuleSelect } from './AccountingCheckSyncedDealRuleSelect';
import { AccountingCheckSyncedDealsTotalCount } from './AccountingCheckSyncedDealsTotalCount';
import {
  AccountingDealBoardFilterBar,
  AccountingDealBoardFilterItem,
  AccountingDealBoardFilterView,
  AccountingDealDateTypeFilterBar,
  AccountingDealDateTypeFilterItem,
  AccountingDealDateTypeFilterView,
  AccountingDealPipelineFilterBar,
  AccountingDealPipelineFilterItem,
  AccountingDealPipelineFilterView,
  AccountingDealStageFilterBar,
  AccountingDealStageFilterItem,
  AccountingDealStageFilterView,
} from './AccountingCheckSyncedDealSelects';

export const AccountingCheckSyncedDealsFilterPopover = () => {
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
      <Filter.Popover>
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
                <AccountingDealBoardFilterItem />
                <AccountingDealPipelineFilterItem />
                <AccountingDealStageFilterItem />
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
                <Filter.Item value="stageChangedDateRange">
                  <IconCalendar />
                  Stage changed date range
                </Filter.Item>
                <AccountingDealDateTypeFilterItem />
              </Command.List>
            </Command>
          </Filter.View>
          <Filter.View filterKey="user">
            <SelectMember.Provider
              mode="single"
              value={user || ''}
              onValueChange={(value) => {
                setUser(String(value));
                resetFilterState();
              }}
            >
              <SelectMember.Content />
            </SelectMember.Provider>
          </Filter.View>
          <AccountingDealBoardFilterView />
          <AccountingDealPipelineFilterView boardId={boardId || undefined} />
          <AccountingDealStageFilterView pipelineId={pipelineId || undefined} />
          <AccountingDealDateTypeFilterView />
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

export const AccountingCheckSyncedDealsFilter = () => {
  const [boardId] = useFilterQueryState<string>('boardId');
  const [pipelineId] = useFilterQueryState<string>('pipelineId');
  const [dealSearch] = useFilterQueryState<string>('dealSearch');
  const [number] = useFilterQueryState<string>('number');

  return (
    <Filter id="accounting-check-synced-deals-filter">
      <Filter.Bar>
        <AccountingCheckSyncedDealsFilterPopover />
        <AccountingCheckSyncedDealRuleSelect />
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
        <Filter.BarItem queryKey="stageChangedDateRange">
          <Filter.BarName>
            <IconCalendar />
            Stage changed date range
          </Filter.BarName>
          <Filter.Date filterKey="stageChangedDateRange" />
        </Filter.BarItem>
        <AccountingDealBoardFilterBar />
        <AccountingDealPipelineFilterBar boardId={boardId || undefined} />
        <AccountingDealStageFilterBar pipelineId={pipelineId || undefined} />
        <SelectMember.FilterBar queryKey="user" label="Assigned To" />
        <AccountingDealDateTypeFilterBar />
        <AccountingCheckSyncedDealsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
