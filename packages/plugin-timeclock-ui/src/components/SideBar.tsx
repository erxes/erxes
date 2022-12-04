import { router, __ } from '@erxes/ui/src/utils';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import React, { useState } from 'react';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { SidebarActions, SidebarHeader } from '../styles';
import { CustomRangeContainer } from '../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Button from '@erxes/ui/src/components/Button';
import SelectDepartments from '@erxes/ui-settings/src/departments/containers/SelectDepartments';
import Select from 'react-select-plus';
import ControlLabel from '@erxes/ui/src/components/form/Label';

type Props = {
  queryParams: any;
  history: any;
};

const LeftSideBar = (props: Props) => {
  const { queryParams, history } = props;
  const [userIds, setUsers] = useState(['']);
  const [selectedBranchId, setBranches] = useState(['']);
  const [deptIds, setDeptIds] = useState(['']);

  const onBranchSelect = selectedBranch => {
    setBranches(selectedBranch);

    const branchIds: any[] = [];
    selectedBranch.map(branch => branchIds.push(branch.value));

    router.setParams(history, {
      branchIds: `${branchIds}`
    });
  };

  const renderBranchOptions = (branches: any[]) => {
    return branches.map(branch => ({
      value: branch._id,
      label: branch.title
    }));
  };

  const onDepartmentSelect = dept => {
    console.log('sidedept', dept);
    setDeptIds(dept);
    router.setParams(history, {
      departmentIds: dept
    });
  };

  const onMemberSelect = selectedUserIds => {
    console.log('sidebar', selectedUserIds);
    setUsers(userIds);
    // onUserSelect(selectedUserIds);
  };

  const renderSidebarActions = () => {
    return (
      <SidebarHeader>
        <CustomRangeContainer>
          <DateControl
            // value={new Date()}
            required={false}
            name="startDate"
            // onChange={onSelectDateChange}
            placeholder={'Starting date'}
            dateFormat={'YYYY-MM-DD'}
          />
          <DateControl
            // value={new Date()}
            required={false}
            name="startDate"
            // onChange={onSelectDateChange}
            placeholder={'Ending date'}
            dateFormat={'YYYY-MM-DD'}
          />
          <Button btnStyle="primary">Filter</Button>
        </CustomRangeContainer>
      </SidebarHeader>
    );
  };

  const renderSidebarHeader = () => {
    return <SidebarActions>{renderSidebarActions()}</SidebarActions>;
  };

  return (
    <Sidebar wide={true} hasBorder={true} header={renderSidebarHeader()}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          margin: '20px 20px',
          gap: '10px'
        }}
      >
        <SelectTeamMembers
          // queryParams={queryParams}
          initialValue={userIds}
          label="Team member"
          name="userIds"
          onSelect={onMemberSelect}
        />
        <SelectDepartments
          isRequired={false}
          defaultValue={deptIds}
          onChange={onDepartmentSelect}
        />
        <div>
          <ControlLabel>Branches</ControlLabel>
          <Select
            value={selectedBranchId}
            onChange={onBranchSelect}
            placeholder="Select branch"
            multi={true}
            // options={branchesList && renderBranchOptions(branchesList)}
          />
        </div>
      </div>
    </Sidebar>
  );
};

export default LeftSideBar;
