import { IconCalendar } from '@tabler/icons-react';

import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { VoucherHotKeyScope } from '../types/path/VoucherHotKeyScope';
import { VoucherTotalCount } from './VoucherTotalCount';
import { useVoucherLeadSessionKey } from '../hooks/useVoucherLeadSessionKey';
import { SelectStatus } from './selects/SelectStatus';
import { SelectVoucherCampaign } from './selects/SelectVoucherCampaign';
import { SelectOwnerType } from './selects/SelectOwnerType';
import { SelectOrderType } from './selects/SelectOrderType';
import { SelectSortField } from './selects/SelectSortField';

const VoucherFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    voucherCampaignId: string;
    ownerType: string;
    sortField: string;
    orderType: string;
    status: string;
    date: string;
  }>([
    'voucherCampaignId',
    'ownerType',
    'sortField',
    'orderType',
    'status',
    'date',
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope={VoucherHotKeyScope.VoucherPage}>
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
                <SelectVoucherCampaign.FilterItem />
                <SelectOwnerType.FilterItem />
                <SelectSortField.FilterItem />
                <SelectOrderType.FilterItem />
                <SelectStatus.FilterItem />
                <Filter.Item value="date">
                  <IconCalendar />
                  Date
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectVoucherCampaign.FilterView />
          <SelectOwnerType.FilterView />
          <SelectSortField.FilterView />
          <SelectOrderType.FilterView />
          <SelectStatus.FilterView />
          <Filter.View filterKey="date">
            <Filter.DateView filterKey="date" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="voucherCampaignId" inDialog>
          <SelectVoucherCampaign.FilterView />
        </Filter.View>
        <Filter.View filterKey="ownerType" inDialog>
          <SelectOwnerType.FilterView />
        </Filter.View>
        <Filter.View filterKey="sortField" inDialog>
          <SelectSortField.FilterView />
        </Filter.View>
        <Filter.View filterKey="orderType" inDialog>
          <SelectOrderType.FilterView />
        </Filter.View>
        <Filter.View filterKey="status" inDialog>
          <SelectStatus.FilterView />
        </Filter.View>
        <Filter.View filterKey="date" inDialog>
          <Filter.DialogDateView filterKey="date" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const VoucherFilter = () => {
  const { sessionKey } = useVoucherLeadSessionKey();

  return (
    <Filter id="voucher-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <SelectVoucherCampaign.FilterBar />
        <SelectOwnerType.FilterBar />
        <SelectSortField.FilterBar />
        <SelectOrderType.FilterBar />
        <SelectStatus.FilterBar />
        <Filter.BarItem queryKey="date">
          <Filter.BarName>
            <IconCalendar />
            Date
          </Filter.BarName>
          <Filter.Date filterKey="date" />
        </Filter.BarItem>
        <VoucherFilterPopover />
        <VoucherTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
