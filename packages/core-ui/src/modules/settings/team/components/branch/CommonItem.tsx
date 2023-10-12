import React from 'react';
import CommonList from './CommonList';
import BranchForm from '../../containers/branch/Form';
import DepartmentForm from '../../containers/department/Form';
import UnitForm from '../../containers/unit/Form';
import { IBranch, IDepartment, IUnit } from '@erxes/ui/src/team/types';
import { mutations } from '@erxes/ui/src/team/graphql';

type ListQueryType = {
  data: { items: any[] };
  refetch: () => void;
};

type Props = {
  branchListQuery: ListQueryType;
  departmentListQuery: ListQueryType;
  unitListQuery: ListQueryType;
};

const CommonItem: React.FC<Props> = ({
  branchListQuery,
  departmentListQuery,
  unitListQuery
}) => {
  return (
    <div>
      <CommonList<IBranch>
        listQuery={branchListQuery}
        title="Branch"
        removeMutation={mutations.branchesRemove}
        FormComponent={BranchForm}
        dataKey="branches"
      />
      <CommonList<IDepartment>
        listQuery={departmentListQuery}
        title="Department"
        removeMutation={mutations.departmentsRemove}
        FormComponent={DepartmentForm}
        dataKey="departments"
      />
      <CommonList<IUnit>
        listQuery={unitListQuery}
        title="Unit"
        removeMutation={mutations.unitsRemove}
        FormComponent={UnitForm}
        dataKey="units"
      />
    </div>
  );
};

export default CommonItem;
