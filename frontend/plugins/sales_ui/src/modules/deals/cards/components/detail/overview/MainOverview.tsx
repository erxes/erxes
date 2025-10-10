import {
  SelectBranches,
  SelectCompany,
  SelectCustomer,
  SelectDepartments,
  SelectMember,
} from 'ui-modules';

import { IDeal } from '@/deals/types/deals';
import LabelChooser from './label/LabelChooser';
import Priority from './Priority';
import SelectTags from './tags/SelectTags';
import { useDealsContext } from '@/deals/context/DealContext';

const MainOverview = ({ deal }: { deal: IDeal }) => {
  const { editDeals, editConformity } = useDealsContext();

  const handleDealFieldChange = (
    key: string,
    value: string | string[] | undefined,
  ) => {
    if (!value) return;
    editDeals({
      variables: {
        _id: deal._id,
        [key]: Array.isArray(value) ? value : [value],
      },
    });
  };

  const handleConformityChange = (
    key: string,
    value: string | string[] | undefined,
  ) => {
    editConformity({
      variables: {
        mainType: 'deal',
        mainTypeId: deal._id,
        relType: key,
        relTypeIds: Array.isArray(value) ? value : [value],
      },
    });
  };

  return (
    <div className="border-b py-4 px-8">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Assigned to</h4>
          <SelectMember
            value={deal.assignedUserIds}
            onValueChange={(value) =>
              handleDealFieldChange('assignedUserIds', value)
            }
            className="text-foreground"
          />
        </div>
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Label</h4>
          <LabelChooser labels={deal.labels || []} />
        </div>
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Priority</h4>
          <Priority priority={deal.priority || ''} dealId={deal._id} />
        </div>
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Tags</h4>
          <SelectTags dealTags={deal.tags || []} tagIds={deal.tagIds || []} />
        </div>
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Departments</h4>

          <SelectDepartments.InlineCell
            mode="multiple"
            value={deal.departmentIds}
            onValueChange={(value) =>
              handleDealFieldChange('departmentIds', value)
            }
          />
        </div>
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Branches</h4>
          <SelectBranches.InlineCell
            mode="multiple"
            value={deal.branchIds}
            onValueChange={(value) => handleDealFieldChange('branchIds', value)}
          />
        </div>
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Customers</h4>
          <SelectCustomer
            mode="multiple"
            value={(deal.customers || []).map(
              (customer) => customer?._id || '',
            )}
            onValueChange={(value) =>
              handleConformityChange('customerIds', value)
            }
          />
        </div>
        <div>
          <h4 className="uppercase text-sm text-gray-500 pb-2">Companies</h4>
          <SelectCompany
            mode="multiple"
            value={(deal.companies || []).map((company) => company?._id || '')}
            onValueChange={(value) =>
              handleConformityChange('companyIds', value)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default MainOverview;
