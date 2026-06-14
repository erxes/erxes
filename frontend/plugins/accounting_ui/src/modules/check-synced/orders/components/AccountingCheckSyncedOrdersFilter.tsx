import {
  IconBuilding,
  IconCalendar,
  IconClock,
  IconHash,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useFilterQueryState,
  useMultiQueryState,
} from 'erxes-ui';
import {
  AccountingCheckSyncedOrderRuleFilterBar,
  AccountingCheckSyncedOrderRuleFilterItem,
  AccountingCheckSyncedOrderRuleFilterView,
} from './AccountingCheckSyncedOrderRuleSelect';
import {
  AccountingOrderPosFilterBar,
  AccountingOrderPosFilterItem,
  AccountingOrderPosFilterView,
} from './AccountingCheckSyncedOrderSelects';
import { AccountingCheckSyncedOrdersTotalCount } from './AccountingCheckSyncedOrdersTotalCount';

export const AccountingCheckSyncedOrdersFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    orderRuleId: string;
    pos: string;
    searchValue: string;
    number: string;
    createdDateRange: string;
    paidDateRange: string;
  }>([
    'orderRuleId',
    'pos',
    'searchValue',
    'number',
    'createdDateRange',
    'paidDateRange',
  ]);
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

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
                <AccountingCheckSyncedOrderRuleFilterItem />
                <AccountingOrderPosFilterItem />
                <Command.Separator className="my-1" />
                <Filter.Item value="searchValue" inDialog>
                  <IconBuilding />
                  Search
                </Filter.Item>
                <Filter.Item value="number" inDialog>
                  <IconHash />
                  Number
                </Filter.Item>
                <Filter.Item value="createdDateRange">
                  <IconClock />
                  Created date range
                </Filter.Item>
                <Filter.Item value="paidDateRange">
                  <IconCalendar />
                  Paid date range
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <AccountingCheckSyncedOrderRuleFilterView />
          <AccountingOrderPosFilterView />
          <Filter.View filterKey="createdDateRange">
            <Filter.DateView filterKey="createdDateRange" />
          </Filter.View>
          <Filter.View filterKey="paidDateRange">
            <Filter.DateView filterKey="paidDateRange" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
        <Filter.View filterKey="number" inDialog>
          <Filter.DialogStringView filterKey="number" />
        </Filter.View>
        <Filter.View filterKey="createdDateRange" inDialog>
          <Filter.DialogDateView filterKey="createdDateRange" />
        </Filter.View>
        <Filter.View filterKey="paidDateRange" inDialog>
          <Filter.DialogDateView filterKey="paidDateRange" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const AccountingCheckSyncedOrdersFilter = () => {
  const [searchValue] = useFilterQueryState<string>('searchValue');
  const [number] = useFilterQueryState<string>('number');

  return (
    <Filter id="accounting-check-synced-orders-filter">
      <Filter.Bar>
        <AccountingCheckSyncedOrdersFilterPopover />
        <AccountingCheckSyncedOrderRuleFilterBar />
        <AccountingOrderPosFilterBar />
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconBuilding />
            Search
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
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
        <Filter.BarItem queryKey="createdDateRange">
          <Filter.BarName>
            <IconClock />
            Created date range
          </Filter.BarName>
          <Filter.Date filterKey="createdDateRange" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="paidDateRange">
          <Filter.BarName>
            <IconCalendar />
            Paid date range
          </Filter.BarName>
          <Filter.Date filterKey="paidDateRange" />
        </Filter.BarItem>
        <AccountingCheckSyncedOrdersTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
