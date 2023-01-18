import { router, __ } from '@erxes/ui/src/utils';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import React, { useState } from 'react';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { SidebarActions, SidebarHeader } from '../../styles';
import { CustomRangeContainer } from '../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Button from '@erxes/ui/src/components/Button';
import SelectDepartments from '@erxes/ui-settings/src/departments/containers/SelectDepartments';
import Select from 'react-select-plus';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IBranch } from '@erxes/ui/src/team/types';

type Props = {
  queryParams: any;
  history: any;
  branchesList: IBranch[];
};

const LeftSideBar = (props: Props) => {
  const { history, branchesList, queryParams } = props;

  const [currUserIds, setUserIds] = useState(queryParams.userIds);
  const [selectedBranches, setBranches] = useState(queryParams.branchIds);
  const [deptIds, setDeptIds] = useState(queryParams.departmentIds);
  const [startDate, setStartDate] = useState(queryParams.startDate);
  const [endDate, setEndDate] = useState(queryParams.endDate);

  const cleanFilter = () => {
    onBranchSelect([]);
    onDepartmentSelect([]);
    onMemberSelect([]);
    onStartDateChange(null);
    onEndDateChange(null);
    router.removeParams(
      history,
      'userIds',
      'branchIds',
      'startDate',
      'endDate',
      'departmentIds'
    );
    removePageParams();
  };

  const removePageParams = () => {
    router.removeParams(history, 'page', 'perPage');
  };

  const renderBranchOptions = (branches: any[]) => {
    return branches.map(branch => ({
      value: branch._id,
      label: branch.title,
      userIds: branch.userIds
    }));
  };

  const onBranchSelect = selectedBranch => {
    setBranches(selectedBranch);
    const selectedBranchIds: string[] = [];
    selectedBranch.map(branch => {
      selectedBranchIds.push(branch.value);
    });

    router.setParams(history, {
      branchIds: selectedBranchIds
    });
    removePageParams();
  };

  const onDepartmentSelect = dept => {
    setDeptIds(dept);
    router.setParams(history, {
      departmentIds: dept
    });
    removePageParams();
  };

  const onMemberSelect = selectedUsers => {
    setUserIds(selectedUsers);
    router.setParams(history, {
      userIds: selectedUsers
    });
    removePageParams();
  };

  const onStartDateChange = date => {
    setStartDate(date);
    router.setParams(history, { startDate: date });
    removePageParams();
  };

  const onEndDateChange = date => {
    setEndDate(date);
    router.setParams(history, { endDate: date });
    removePageParams();
  };

  const renderSidebarActions = () => {
    return (
      <SidebarHeader>
        <CustomRangeContainer>
          <DateControl
            required={false}
            value={startDate}
            name="startDate"
            placeholder={'Starting date'}
            dateFormat={'YYYY-MM-DD'}
            onChange={onStartDateChange}
          />
          <DateControl
            required={false}
            value={endDate}
            name="endDate"
            placeholder={'Ending date'}
            dateFormat={'YYYY-MM-DD'}
            onChange={onEndDateChange}
          />
          <Button btnStyle="primary" onClick={cleanFilter}>
            Clear
          </Button>
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
          initialValue={currUserIds}
          label="Team member"
          name="userIds"
          queryParams={queryParams}
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
            value={selectedBranches}
            onChange={onBranchSelect}
            placeholder="Select branch"
            multi={true}
            options={branchesList && renderBranchOptions(branchesList)}
          />
        </div>
      </div>
    </Sidebar>
  );
};

export default LeftSideBar;
