import {
  SelectBranches,
  SelectDepartments,
  SelectMember,
  SelectTags,
} from 'ui-modules';

import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { IDeal } from '@/deals/types/deals';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { useDealsContext } from '@/deals/context/DealContext';

const MainOverview = ({ deal }: { deal: IDeal }) => {
  const { editDeals } = useDealsContext();

  const handleDealFieldChange = (
    key: string,
    value: string | string[] | undefined | null,
  ) => {
    if (!value) return;
    editDeals({
      variables: {
        _id: deal._id,
        [key]: Array.isArray(value) ? value : [value],
      },
    });
  };

  const {
    startDate,
    closeDate,
    _id,
    assignedUserIds,
    labels,
    priority,
    tagIds,
    branchIds,
    departmentIds,
  } = deal;

  return (
    <div className="border-b py-4 px-8">
      <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-4">
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Due date</h4>
          <div className="flex items-center">
            <DateSelectDeal
              value={startDate}
              id={_id}
              type="startDate"
              variant="button"
            />
            <span className="mx-2">to</span>
            <DateSelectDeal
              value={closeDate}
              id={_id}
              type="closeDate"
              variant="button"
            />
          </div>
        </div>
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Label</h4>
          <div className="flex flex-wrap items-center gap-1">
            <SelectLabels.FilterBar
              filterKey=""
              mode="multiple"
              label="By Label"
              variant="card"
              targetId={_id}
              initialValue={labels?.map((label) => label._id || '') || []}
            />
            {labels?.map((label) => (
              <div
                key={label._id}
                className="ml-1 pl-2 pr-2 py-1 rounded text-white text-sm font-medium inline-block"
                style={{ backgroundColor: label.colorCode }}
              >
                {label.name}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Priority</h4>
          <SelectDealPriority
            dealId={_id}
            value={priority || ''}
            variant="card"
          />
        </div>
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Assigned to</h4>
          <SelectMember
            value={assignedUserIds}
            onValueChange={(value) =>
              handleDealFieldChange('assignedUserIds', value)
            }
            className="text-foreground"
            mode="multiple"
          />
        </div>
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Tags</h4>
          <SelectTags
            tagType="sales:deal"
            mode="multiple"
            value={tagIds}
            onValueChange={(value) => {
              handleDealFieldChange('tagIds', value);
            }}
          />
        </div>
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Branches</h4>
          <div className="shadow-xs rounded">
            <SelectBranches.InlineCell
              mode="multiple"
              value={branchIds}
              onValueChange={(value) => {
                handleDealFieldChange('branchIds', value);
              }}
            />
          </div>
        </div>
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Departments</h4>
          <div className="shadow-xs rounded">
            <SelectDepartments.InlineCell
              mode="multiple"
              value={departmentIds}
              onValueChange={(value) => {
                handleDealFieldChange('departmentIds', value);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainOverview;
