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
import { ASSIGNMENT_CURSOR_SESSION_KEY } from '../hooks/useAssignmentList';
import { SelectOwner } from '~/modules/loyalties/components/SelectOwner';
import { SelectOwnerType } from '../../vouchers/components/selects/SelectOwnerType';

const AssignmentFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    assignmentCampaignId: string | null;
    assignmentStatus: string | null;
    assignmentOwnerType: string | null;
    assignmentOwnerId: string | null;
  }>([
    'assignmentCampaignId',
    'assignmentStatus',
    'assignmentOwnerType',
    'assignmentOwnerId',
  ]);

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
                <SelectOwnerType.FilterItem
                  queryKey="assignmentOwnerType"
                />
                <SelectOwner.FilterItem queryKey="assignmentOwnerId" />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectAssignmentCampaignFilterView />
          <SelectAssignmentStatusFilterView />
          <SelectOwnerType.FilterView queryKey="assignmentOwnerType" />
          <SelectOwner.FilterView
            queryKey="assignmentOwnerId"
            ownerTypeKey="assignmentOwnerType"
          />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="assignmentCampaignId" inDialog>
          <SelectAssignmentCampaignFilterView />
        </Filter.View>
        <Filter.View filterKey="assignmentStatus" inDialog>
          <SelectAssignmentStatusFilterView />
        </Filter.View>
        <Filter.View filterKey="assignmentOwnerType" inDialog>
          <SelectOwnerType.FilterView queryKey="assignmentOwnerType" />
        </Filter.View>
        <Filter.View filterKey="assignmentOwnerId" inDialog>
          <SelectOwner.FilterView
            queryKey="assignmentOwnerId"
            ownerTypeKey="assignmentOwnerType"
          />
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
        <SelectOwnerType.FilterBar queryKey="assignmentOwnerType" />
        <SelectOwner.FilterBar
          queryKey="assignmentOwnerId"
          ownerTypeKey="assignmentOwnerType"
        />
        <AssignmentFilterPopover />
        <AssignmentTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
