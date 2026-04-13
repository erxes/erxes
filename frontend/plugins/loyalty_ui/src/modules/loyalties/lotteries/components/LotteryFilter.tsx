import { IconUser } from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { LotteryHotKeyScope } from '../types/path/LotteryHotKeyScope';
import { LotteryTotalCount } from './LotteryTotalCount';
import { useLotteryLeadSessionKey } from '../hooks/useLotteryLeadSessionKey';
import { SelectStatus } from './selects/SelectStatus';
import { SelectLotteryCampaign } from './selects/SelectLotteryCampaign';
import { SelectOwnerType } from './selects/SelectOwnerType';
import { SelectVoucherCampaign } from '../../vouchers/components/selects/SelectVoucherCampaign';
import { SelectCustomer, SelectMember } from 'ui-modules';

const LotteryFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    lotteryCampaign: string;
    ownerType: string;
    status: string;
    voucherCampaignId: string;
    ownerId: string;
    userId: string;
  }>([
    'lotteryCampaign',
    'ownerType',
    'status',
    'voucherCampaignId',
    'ownerId',
    'userId',
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope={LotteryHotKeyScope.LotteryPage}>
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
                <SelectLotteryCampaign.FilterItem />
                <SelectVoucherCampaign.FilterItem />
                <SelectOwnerType.FilterItem />
                <SelectCustomer.FilterItem value="ownerId" label="Customer" />
                <SelectMember.FilterItem value="userId" label="Team Member" />
                <SelectStatus.FilterItem />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectLotteryCampaign.FilterView />
          <SelectVoucherCampaign.FilterView />
          <SelectOwnerType.FilterView />
          <SelectCustomer.FilterView filterKey="ownerId" mode="single" />
          <SelectMember.FilterView queryKey="userId" mode="single" />
          <SelectStatus.FilterView />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="lotteryCampaign" inDialog>
          <SelectLotteryCampaign.FilterView queryKey="lotteryCampaign" />
        </Filter.View>
        <Filter.View filterKey="voucherCampaignId" inDialog>
          <SelectVoucherCampaign.FilterView />
        </Filter.View>
        <Filter.View filterKey="ownerType" inDialog>
          <SelectOwnerType.FilterView />
        </Filter.View>
        <Filter.View filterKey="ownerId" inDialog>
          <SelectCustomer.FilterView filterKey="ownerId" mode="single" />
        </Filter.View>
        <Filter.View filterKey="userId" inDialog>
          <SelectMember.FilterView queryKey="userId" mode="single" />
        </Filter.View>
        <Filter.View filterKey="status" inDialog>
          <SelectStatus.FilterView />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const LotteryFilter = () => {
  const { sessionKey } = useLotteryLeadSessionKey();

  return (
    <Filter id="lottery-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <SelectLotteryCampaign.FilterBar />
        <SelectVoucherCampaign.FilterBar />
        <SelectOwnerType.FilterBar />
        <Filter.BarItem queryKey="ownerId">
          <Filter.BarName>
            <IconUser />
            Customer
          </Filter.BarName>
          <SelectCustomer.FilterBar
            filterKey="ownerId"
            label="Customer"
            mode="single"
          />
        </Filter.BarItem>
        <SelectMember.FilterBar
          queryKey="userId"
          label="Team Member"
          mode="single"
        />
        <SelectStatus.FilterBar />
        <LotteryFilterPopover />
        <LotteryTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
