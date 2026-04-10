import { IconCalendar } from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { CouponTotalCount } from './CouponTotalCount';
import {
  SelectCouponCampaignFilterItem,
  SelectCouponCampaignFilterView,
  SelectCouponCampaignFilterBar,
} from './selects/SelectCouponCampaign';
import {
  SelectCouponStatusFilterItem,
  SelectCouponStatusFilterView,
  SelectCouponStatusFilterBar,
} from './selects/SelectCouponStatus';
import { SelectOwnerType } from '../../vouchers/components/selects/SelectOwnerType';
import { SelectSortField } from '../../vouchers/components/selects/SelectSortField';
import { SelectOrderType } from '../../vouchers/components/selects/SelectOrderType';

const CouponFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    couponCampaignId: string;
    couponStatus: string;
    ownerType: string;
    couponDate: string;
    sortField: string;
    orderType: string;
  }>(['couponCampaignId', 'couponStatus', 'ownerType', 'couponDate', 'sortField', 'orderType']);

  const hasFilters = Object.values(queries || {}).some((v) => v !== null);

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
                <SelectCouponCampaignFilterItem />
                <SelectOwnerType.FilterItem />
                <SelectSortField.FilterItem />
                <SelectOrderType.FilterItem />
                <SelectCouponStatusFilterItem />
                <Filter.Item value="couponDate">
                  <IconCalendar />
                  Date
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectCouponCampaignFilterView />
          <SelectOwnerType.FilterView queryKey="ownerType" />
          <SelectSortField.FilterView queryKey="sortField" />
          <SelectOrderType.FilterView queryKey="orderType" />
          <SelectCouponStatusFilterView />
          <Filter.View filterKey="couponDate">
            <Filter.DateView filterKey="couponDate" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="couponCampaignId" inDialog>
          <SelectCouponCampaignFilterView queryKey="couponCampaignId" />
        </Filter.View>
        <Filter.View filterKey="ownerType" inDialog>
          <SelectOwnerType.FilterView queryKey="ownerType" />
        </Filter.View>
        <Filter.View filterKey="sortField" inDialog>
          <SelectSortField.FilterView queryKey="sortField" />
        </Filter.View>
        <Filter.View filterKey="orderType" inDialog>
          <SelectOrderType.FilterView queryKey="orderType" />
        </Filter.View>
        <Filter.View filterKey="couponStatus" inDialog>
          <SelectCouponStatusFilterView />
        </Filter.View>
        <Filter.View filterKey="couponDate" inDialog>
          <Filter.DialogDateView filterKey="couponDate" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const CouponFilter = () => {
  return (
    <Filter id="coupon-filter" sessionKey="coupons_cursor">
      <Filter.Bar>
        <SelectCouponCampaignFilterBar />
        <SelectOwnerType.FilterBar />
        <SelectSortField.FilterBar />
        <SelectOrderType.FilterBar />
        <SelectCouponStatusFilterBar />
        <Filter.BarItem queryKey="couponDate">
          <Filter.BarName>
            <IconCalendar />
            Date
          </Filter.BarName>
          <Filter.Date filterKey="couponDate" />
        </Filter.BarItem>
        <CouponFilterPopover />
        <CouponTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
