import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { LotteryHotKeyScope } from '../types/path/LotteryHotKeyScope';
import { LotteryTotalCount } from './LotteryTotalCount';
import { useLotteryLeadSessionKey } from '../hooks/useLotteryLeadSessionKey';
import { SelectStatus } from './selects/SelectStatus';
import { SelectLotteryCampaign } from './selects/SelectLotteryCampaign';
import { SelectOwnerType } from './selects/SelectOwnerType';
import { SelectVoucherCampaign } from '../../vouchers/components/selects/SelectVoucherCampaign';
import { SelectOwner } from '~/modules/loyalties/components/SelectOwner';

const LotteryFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    lotteryCampaign: string;
    ownerType: string;
    status: string;
    voucherCampaignId: string;
    ownerId: string;
  }>([
    'lotteryCampaign',
    'ownerType',
    'status',
    'voucherCampaignId',
    'ownerId',
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
                <SelectOwner.FilterItem queryKey="ownerId" />
                <SelectStatus.FilterItem />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectLotteryCampaign.FilterView />
          <SelectVoucherCampaign.FilterView />
          <SelectOwnerType.FilterView />
          <SelectOwner.FilterView queryKey="ownerId" ownerTypeKey="ownerType" />
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
          <SelectOwner.FilterView queryKey="ownerId" ownerTypeKey="ownerType" />
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
        <SelectOwner.FilterBar queryKey="ownerId" ownerTypeKey="ownerType" />
        <SelectStatus.FilterBar />
        <LotteryFilterPopover />
        <LotteryTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
