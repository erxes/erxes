import { IconUser } from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { DonateHotKeyScope } from '../types/path/DonateHotKeyScope';
import { DonateTotalCount } from './DonateTotalCount';
import { useDonateLeadSessionKey } from '../hooks/useDonateLeadSessionKey';
import { SelectStatus } from './selects/SelectStatus';
import { SelectDonateCampaign } from './selects/SelectDonateCampaign';
import { SelectOwnerType } from './selects/SelectOwnerType';
import { SelectCustomer, SelectMember } from 'ui-modules';

const DonateFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    donateCampaign: string;
    ownerType: string;
    status: string;
    ownerId: string;
    userId: string;
  }>(['donateCampaign', 'ownerType', 'status', 'ownerId', 'userId']);

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
                <SelectCustomer.FilterItem value="ownerId" label="Customer" />
                <SelectMember.FilterItem value="userId" label="Team Member" />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectDonateCampaign.FilterView />
          <SelectStatus.FilterView />
          <SelectOwnerType.FilterView />
          <SelectCustomer.FilterView filterKey="ownerId" mode="single" />
          <SelectMember.FilterView queryKey="userId" mode="single" />
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
          <SelectCustomer.FilterView filterKey="ownerId" mode="single" />
        </Filter.View>
        <Filter.View filterKey="userId" inDialog>
          <SelectMember.FilterView queryKey="userId" mode="single" />
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
        <DonateFilterPopover />
        <DonateTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
