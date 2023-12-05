import React from 'react';
import { ControlLabel } from '@erxes/ui/src/components';

import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

type Props = {
  handleUserChange: (userIds: any) => void;
  handleDepartmentChange: (departmentIds: any) => void;
  userIds?: string[];
  departmentIds?: string[];
};
const SelectMembersForm = (props: Props) => {
  const {
    handleDepartmentChange,
    handleUserChange,
    userIds,
    departmentIds
  } = props;

  return (
    <>
      <ControlLabel>Select members or departments</ControlLabel>
      <SelectTeamMembers
        label={'Choose team members'}
        name="assignedUserIds"
        onSelect={handleUserChange}
        initialValue={userIds}
      />
      <SelectDepartments
        name="assignedDepartmentIds"
        label={'Select departments'}
        onSelect={handleDepartmentChange}
        initialValue={departmentIds}
      />
    </>
  );
};

export default SelectMembersForm;
