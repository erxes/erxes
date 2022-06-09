import CategoryList from '../containers/CategoryList';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { PaddingTop } from '../../styles';
import { router } from '@erxes/ui/src/utils/core';
import { Wrapper } from '@erxes/ui/src/layout';

function Sidebar({ history, queryParams }: { history: any; queryParams: any }) {
  const setFilter = (name, value) => {
    router.setParams(history, { [name]: value });
  };

  return (
    <Wrapper.Sidebar>
      <PaddingTop>
        <FormGroup>
          <ControlLabel>Branch</ControlLabel>
          <SelectBranches
            label="Choose branch"
            name="selectedBranchIds"
            initialValue={queryParams.branchId}
            onSelect={branchId => setFilter('branchId', branchId)}
            multi={false}
            customOption={{ value: '', label: 'All branches' }}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Department</ControlLabel>
          <SelectDepartments
            label="Choose department"
            name="selectedDepartmentIds"
            initialValue={queryParams.departmentId}
            onSelect={departmentId => setFilter('departmentId', departmentId)}
            multi={false}
            customOption={{ value: '', label: 'All departments' }}
          />
        </FormGroup>

        <CategoryList queryParams={queryParams} history={history} />
      </PaddingTop>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
