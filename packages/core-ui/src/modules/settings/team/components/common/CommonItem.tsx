import React from 'react';
import CommonList from './CommonList';
import BranchForm from '../../containers/branch/Form';
import DepartmentForm from '../../containers/department/Form';
import UnitForm from '../../containers/unit/Form';
import { IBranch, IDepartment, IUnit } from '@erxes/ui/src/team/types';
import { mutations } from '@erxes/ui/src/team/graphql';
import { ModalTrigger } from '@erxes/ui/src/components';

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
  const renderBranchTrigger = (trigger: React.ReactNode, branch: IBranch) => {
    const content = ({ closeModal }) => (
      <BranchForm branch={branch} closeModal={closeModal} />
    );

    return (
      <ModalTrigger title="Edit a Branch" trigger={trigger} content={content} />
    );
  };

  const renderDepartmentTrigger = (
    trigger: React.ReactNode,
    department: IDepartment
  ) => {
    const content = ({ closeModal }) => (
      <DepartmentForm department={department} closeModal={closeModal} />
    );

    return (
      <ModalTrigger
        title="Edit a Department"
        trigger={trigger}
        content={content}
      />
    );
  };

  const renderUnitTrigger = (trigger: React.ReactNode, unit: IUnit) => {
    const content = ({ closeModal }) => (
      <UnitForm unit={unit} closeModal={closeModal} />
    );

    return (
      <ModalTrigger title="Edit a Unit" trigger={trigger} content={content} />
    );
  };

  return (
    <div>
      <CommonList<IBranch>
        listQuery={branchListQuery}
        title="Branch"
        removeMutation={mutations.branchesRemove}
        FormComponent={BranchForm}
        dataKey="branches"
        renderFormTrigger={renderBranchTrigger}
      />
      <CommonList<IDepartment>
        listQuery={departmentListQuery}
        title="Department"
        removeMutation={mutations.departmentsRemove}
        FormComponent={DepartmentForm}
        dataKey="departments"
        renderFormTrigger={renderDepartmentTrigger}
      />
      <CommonList<IUnit>
        listQuery={unitListQuery}
        title="Unit"
        removeMutation={mutations.unitsRemove}
        FormComponent={UnitForm}
        dataKey="units"
        renderFormTrigger={renderUnitTrigger}
      />
    </div>
  );
};

export default CommonItem;
