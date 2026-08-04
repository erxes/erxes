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
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';
import {
  AccountingCheckSyncedDealRuleFilterBar,
  AccountingCheckSyncedDealRuleFilterItem,
  AccountingCheckSyncedDealRuleFilterView,
} from './AccountingCheckSyncedDealRuleSelect';
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
  const { t } = useTranslation('accounting');
  const [boardId] = useFilterQueryState<string>('boardId');
  const [pipelineId] = useFilterQueryState<string>('pipelineId');
  const [user, setUser] = useQueryState<string>('user');
  const [queries] = useMultiQueryState<{
    boardId: string;
    pipelineId: string;
    ruleId: string;
    stageId: string;
    user: string;
    dealSearch: string;
    number: string;
    dateType: string;
    dateRange: string;
    createdDateRange: string;
    stageChangedDateRange: string;
  }>([
    'user',
    'ruleId',
    'boardId',
    'pipelineId',
    'stageId',
    'dealSearch',
    'number',
    'dateType',
    'dateRange',
    'createdDateRange',
    'stageChangedDateRange',
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
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <AccountingCheckSyncedDealRuleFilterItem />
                <AccountingDealBoardFilterItem />
                <AccountingDealPipelineFilterItem />
                <AccountingDealStageFilterItem />
                <SelectMember.FilterItem value="user" label={t('assigned-to')} />
                <Command.Separator className="my-1" />
                <Filter.Item value="dealSearch" inDialog>
                  <IconBuilding />
                  {t('deal-search')}
                </Filter.Item>
                <Filter.Item value="number" inDialog>
                  <IconHash />
                  {t('number')}
                </Filter.Item>
                <Filter.Item value="dateRange">
                  <IconCalendar />
                  {t('close-date-range')}
                </Filter.Item>
                <Filter.Item value="createdDateRange">
                  <IconCalendar />
                  {t('created-date-range')}
                </Filter.Item>
                <Filter.Item value="stageChangedDateRange">
                  <IconCalendar />
                  {t('stage-changed-date-range')}
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
          <AccountingCheckSyncedDealRuleFilterView />
          <AccountingDealBoardFilterView />
          <AccountingDealPipelineFilterView boardId={boardId || undefined} />
          <AccountingDealStageFilterView pipelineId={pipelineId || undefined} />
          <AccountingDealDateTypeFilterView />
          <Filter.View filterKey="dateRange">
            <Filter.DateView filterKey="dateRange" />
          </Filter.View>
          <Filter.View filterKey="createdDateRange">
            <Filter.DateView filterKey="createdDateRange" />
          </Filter.View>
          <Filter.View filterKey="stageChangedDateRange">
            <Filter.DateView filterKey="stageChangedDateRange" />
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
        <Filter.View filterKey="dateRange" inDialog>
          <Filter.DialogDateView filterKey="dateRange" />
        </Filter.View>
        <Filter.View filterKey="createdDateRange" inDialog>
          <Filter.DialogDateView filterKey="createdDateRange" />
        </Filter.View>
        <Filter.View filterKey="stageChangedDateRange" inDialog>
          <Filter.DialogDateView filterKey="stageChangedDateRange" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const AccountingCheckSyncedDealsFilter = () => {
  const { t } = useTranslation('accounting');
  const [boardId] = useFilterQueryState<string>('boardId');
  const [pipelineId] = useFilterQueryState<string>('pipelineId');
  const [dealSearch] = useFilterQueryState<string>('dealSearch');
  const [number] = useFilterQueryState<string>('number');

  return (
    <Filter id="accounting-check-synced-deals-filter">
      <Filter.Bar>
        <AccountingCheckSyncedDealsFilterPopover />
        <AccountingCheckSyncedDealRuleFilterBar />
        <Filter.BarItem queryKey="dealSearch">
          <Filter.BarName>
            <IconBuilding />
            {t('deal-search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="dealSearch" inDialog>
            {dealSearch}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="number">
          <Filter.BarName>
            <IconHash />
            {t('number')}
          </Filter.BarName>
          <Filter.BarButton filterKey="number" inDialog>
            {number}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="dateRange">
          <Filter.BarName>
            <IconCalendar />
            {t('close-date-range')}
          </Filter.BarName>
          <Filter.Date filterKey="dateRange" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="createdDateRange">
          <Filter.BarName>
            <IconCalendar />
            {t('created-date-range')}
          </Filter.BarName>
          <Filter.Date filterKey="createdDateRange" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="stageChangedDateRange">
          <Filter.BarName>
            <IconCalendar />
            {t('stage-changed-date-range')}
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
