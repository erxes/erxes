import {
  IconKey,
  IconCashRegister,
  IconHash,
  IconCalendar,
  IconClock,
} from '@tabler/icons-react';
import { SelectMember } from 'ui-modules';
import { CheckPosOrdersHotKeyScope } from '../types/checkPosOrdersHotKeyScope';
import {
  useMultiQueryState,
  useFilterQueryState,
  Combobox,
  Command,
  Filter,
} from 'erxes-ui';
import { useCheckPosOrdersLeadSessionKey } from '../hooks/useCheckPosOrdersLeadSessionKey';
import { SelectPos } from './selects/SelectPos';
import { CheckPosOrdersTotalCount } from './CheckPosOrdersTotalCount';

export const CheckPosOrdersFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    posToken: string;
    pos: string;
    number: string;
    paidDateRange: string;
    createdDateRange: string;
  }>(['posToken', 'pos', 'number', 'paidDateRange', 'createdDateRange']);
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope={CheckPosOrdersHotKeyScope.CheckPosOrdersPage}>
        <Filter.Trigger isFiltered={hasFilters}>Filter</Filter.Trigger>
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="posToken" inDialog>
                  <IconKey />
                  POS Token
                </Filter.Item>
                <Filter.Item value="pos">
                  <IconCashRegister />
                  POS
                </Filter.Item>
                <SelectMember.FilterItem />
                <Command.Separator className="my-1" />
                <Filter.Item value="number" inDialog>
                  <IconHash />
                  Number
                </Filter.Item>
                <Filter.Item value="paidDateRange">
                  <IconCalendar />
                  Paid Date Range
                </Filter.Item>
                <Filter.Item value="createdDateRange">
                  <IconClock />
                  Created Date Range
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectMember.FilterView />
          <SelectPos.FilterView />
          <Filter.View filterKey="paidDateRange">
            <Filter.DateView filterKey="paidDateRange" />
          </Filter.View>
          <Filter.View filterKey="createdDateRange">
            <Filter.DateView filterKey="createdDateRange" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="posToken" inDialog>
          <Filter.DialogStringView filterKey="posToken" />
        </Filter.View>
        <Filter.View filterKey="number" inDialog>
          <Filter.DialogStringView filterKey="number" />
        </Filter.View>
        <Filter.View filterKey="paidDateRange" inDialog>
          <Filter.DialogDateView filterKey="paidDateRange" />
        </Filter.View>
        <Filter.View filterKey="createdDateRange" inDialog>
          <Filter.DialogDateView filterKey="createdDateRange" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const CheckPosOrdersFilter = () => {
  const [posToken] = useFilterQueryState<string>('posToken');
  const [number] = useFilterQueryState<string>('number');
  const { sessionKey } = useCheckPosOrdersLeadSessionKey();
  return (
    <Filter id="check-pos-orders-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <CheckPosOrdersFilterPopover />
        <Filter.BarItem queryKey="posToken">
          <Filter.BarName>
            <IconKey />
            POS Token
          </Filter.BarName>
          <Filter.BarButton filterKey="posToken" inDialog>
            {posToken}
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
        <Filter.BarItem queryKey="paidDateRange">
          <Filter.BarName>
            <IconCalendar />
            Paid Date Range
          </Filter.BarName>
          <Filter.Date filterKey="paidDateRange" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="createdDateRange">
          <Filter.BarName>
            <IconClock />
            Created Date Range
          </Filter.BarName>
          <Filter.Date filterKey="createdDateRange" />
        </Filter.BarItem>
        <SelectPos.FilterBar />
        <SelectMember.FilterBar />
        <CheckPosOrdersTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
