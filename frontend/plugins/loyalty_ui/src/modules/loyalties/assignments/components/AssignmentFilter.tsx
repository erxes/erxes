import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { AssignmentTotalCount } from './AssignmentTotalCount';
import {
  SelectAssignmentCampaignFilterItem,
  SelectAssignmentCampaignFilterView,
  SelectAssignmentCampaignFilterBar,
} from './selects/SelectAssignmentCampaign';
import {
  SelectAssignmentStatusFilterItem,
  SelectAssignmentStatusFilterView,
  SelectAssignmentStatusFilterBar,
} from './selects/SelectAssignmentStatus';
import {
  SelectCustomerFilterItem,
  SelectCustomerFilterView,
  SelectCustomerFilterBar,
} from './selects/SelectCustomer';
import { ASSIGNMENT_CURSOR_SESSION_KEY } from '../hooks/useAssignmentList';

const AssignmentFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    assignmentCampaignId: string | null;
    assignmentStatus: string | null;
    assignmentOwnerId: string | null;
  }>(['assignmentCampaignId', 'assignmentStatus', 'assignmentOwnerId']);

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
                <SelectAssignmentCampaignFilterItem />
                <SelectAssignmentStatusFilterItem />
                <SelectCustomerFilterItem />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectAssignmentCampaignFilterView />
          <SelectAssignmentStatusFilterView />
          <SelectCustomerFilterView />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="assignmentCampaignId" inDialog>
          <SelectAssignmentCampaignFilterView />
        </Filter.View>
        <Filter.View filterKey="assignmentStatus" inDialog>
          <SelectAssignmentStatusFilterView />
        </Filter.View>
        <Filter.View filterKey="assignmentOwnerId" inDialog>
          <SelectCustomerFilterView />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const AssignmentFilter = () => {
  return (
    <Filter id="assignment-filter" sessionKey={ASSIGNMENT_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <SelectAssignmentCampaignFilterBar />
        <SelectAssignmentStatusFilterBar />
        <SelectCustomerFilterBar />
        <AssignmentFilterPopover />
        <AssignmentTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
