import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { DonateHotKeyScope } from '../types/path/DonateHotKeyScope';
import { DonateTotalCount } from './DonateTotalCount';
import { useDonateLeadSessionKey } from '../hooks/useDonateLeadSessionKey';
import { SelectStatus } from './selects/SelectStatus';
import { SelectDonateCampaign } from './selects/SelectDonateCampaign';
import { SelectOwnerType } from './selects/SelectOwnerType';
import { SelectOwner } from '~/modules/loyalties/components/SelectOwner';

const DonateFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    donateCampaign: string;
    ownerType: string;
    status: string;
    ownerId: string;
  }>(['donateCampaign', 'ownerType', 'status', 'ownerId']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope={DonateHotKeyScope.DonatePage}>
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
                <SelectDonateCampaign.FilterItem />
                <SelectStatus.FilterItem />
                <SelectOwnerType.FilterItem />
                <SelectOwner.FilterItem queryKey="ownerId" />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectDonateCampaign.FilterView />
          <SelectStatus.FilterView />
          <SelectOwnerType.FilterView />
          <SelectOwner.FilterView queryKey="ownerId" ownerTypeKey="ownerType" />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="donateCampaign" inDialog>
          <SelectDonateCampaign.FilterView queryKey="donateCampaign" />
        </Filter.View>
        <Filter.View filterKey="status" inDialog>
          <SelectStatus.FilterView />
        </Filter.View>
        <Filter.View filterKey="ownerType" inDialog>
          <SelectOwnerType.FilterView />
        </Filter.View>
        <Filter.View filterKey="ownerId" inDialog>
          <SelectOwner.FilterView queryKey="ownerId" ownerTypeKey="ownerType" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const DonateFilter = () => {
  const { sessionKey } = useDonateLeadSessionKey();

  return (
    <Filter id="donate-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <SelectDonateCampaign.FilterBar />
        <SelectOwnerType.FilterBar />
        <SelectOwner.FilterBar queryKey="ownerId" ownerTypeKey="ownerType" />
        <SelectStatus.FilterBar />
        <DonateFilterPopover />
        <DonateTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
