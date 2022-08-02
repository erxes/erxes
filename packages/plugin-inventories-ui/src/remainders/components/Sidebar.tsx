import React from 'react';
import { __, Wrapper, Box, FormGroup, ControlLabel } from '@erxes/ui/src';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { router } from '@erxes/ui/src/utils/core';
import CategoryFilter from '../containers/CategoryFilter';
import { SidebarContent } from '../../styles';

type Props = {
  queryParams: any;
  history: any;
};

const Sidebar = (props: Props) => {
  const { queryParams, history } = props;

  const setFilter = (name: string, value: any) => {
    router.setParams(history, { [name]: value });
  };

  return (
    <Wrapper.Sidebar>
      <Box title={__('Filter')} isOpen={true} name="showFilter">
        <SidebarContent>
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
        </SidebarContent>
      </Box>
      <CategoryFilter />
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
