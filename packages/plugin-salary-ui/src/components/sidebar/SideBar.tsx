import Button from '@erxes/ui/src/components/Button';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { router } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import {
  CustomRangeContainer,
  FlexColumnCustom,
  SidebarActions,
  SidebarHeader,
  Trigger
} from '../../styles';

type Props = {
  queryParams: any;
  history: any;
};

const NOW = new Date();
// get 1st of the next Month
const startOfNextMonth = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 1);
// get 1st of this month
const startOfThisMonth = new Date(NOW.getFullYear(), NOW.getMonth(), 1);

const LeftSideBar = (props: Props) => {
  const { history, queryParams } = props;

  const [currUserIds, setUserIds] = useState(queryParams.userIds);

  const [selectedBranches, setBranches] = useState(queryParams.branchIds);
  const [selectedDepartments, setDepartments] = useState(
    queryParams.departmentIds
  );
  const [isHovered, setIsHovered] = useState(false);
  const [dateFilterActive, setDateFilterActive] = useState(
    JSON.parse(router.getParam(history, 'dateFilter') || 'false')
  );

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseLeave = () => {
    setIsHovered(false);
  };

  const [startDate, setStartDate] = useState(
    queryParams.startDate || startOfThisMonth
  );
  const [endDate, setEndDate] = useState(
    queryParams.endDate || startOfNextMonth
  );

  const cleanFilter = () => {
    onBranchSelect([]);
    onDepartmentSelect([]);
    onMemberSelect([]);

    setDateFilterActive(false);
    setParams('dateFilter', false);
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

  const setParams = (key: string, value: any) => {
    if (value) {
      router.setParams(history, {
        [key]: value
      });

      removePageParams();
    }
  };

  const onBranchSelect = (selectedValues: any) => {
    setParams('branchIds', selectedValues);
    setBranches(selectedValues);
  };

  const onDepartmentSelect = (selectedValues: any) => {
    setParams('departmentIds', selectedValues);
    setDepartments(selectedValues);
  };

  const onMemberSelect = selectedUsers => {
    setUserIds(selectedUsers);

    setParams('userIds', selectedUsers);
  };

  const onStartDateChange = date => {
    setStartDate(date);
    setParams('startDate', date);
  };

  const onEndDateChange = date => {
    setEndDate(date);

    setParams('endDate', date);
  };

  const renderSidebarActions = () => {
    return (
      dateFilterActive && (
        <SidebarHeader>
          <CustomRangeContainer>
            <DateControl
              required={false}
              value={startDate}
              name='startDate'
              placeholder={'Starting date'}
              dateFormat={'YYYY-MM-DD'}
              onChange={onStartDateChange}
            />
            <DateControl
              required={false}
              value={endDate}
              name='endDate'
              placeholder={'Ending date'}
              dateFormat={'YYYY-MM-DD'}
              onChange={onEndDateChange}
            />
          </CustomRangeContainer>
        </SidebarHeader>
      )
    );
  };

  const renderSidebarHeader = () => {
    return <SidebarActions>{renderSidebarActions()}</SidebarActions>;
  };

  const onDateFilterActiveButton = () => {
    const setValue = !dateFilterActive;

    if (setValue) {
      setParams('startDate', startDate);
      setParams('endDate', endDate);
    }
    setParams('dateFilter', setValue.toString());
    setDateFilterActive(setValue);
  };

  const renderDateFilterMenu = () => {
    return (
      <Trigger
        type='trigger'
        isHoverActionBar={isHovered}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}>
        <div
          className={dateFilterActive ? 'active' : 'passive'}
          onClick={onDateFilterActiveButton}>
          Date filter
        </div>
      </Trigger>
    );
  };

  return (
    <Sidebar wide={true} hasBorder={true} header={renderSidebarHeader()}>
      <FlexColumnCustom marginNum={20}>
        {renderDateFilterMenu()}

        <div>
          <ControlLabel>Departments</ControlLabel>
          <SelectDepartments
            name='departmentIds'
            label='Select departments'
            queryParams={queryParams}
            onSelect={onDepartmentSelect}
            initialValue={selectedDepartments}
          />
        </div>

        <div>
          <ControlLabel>Branches</ControlLabel>
          <SelectBranches
            name='branchIds'
            label='Select branches'
            queryParams={queryParams}
            onSelect={onBranchSelect}
            initialValue={selectedBranches}
          />
        </div>
        <div>
          <ControlLabel>Team members</ControlLabel>
          <SelectTeamMembers
            initialValue={currUserIds}
            customField='employeeId'
            label='Select team member'
            name='userIds'
            queryParams={queryParams}
            onSelect={onMemberSelect}
          />
        </div>

        <Button btnStyle='warning' onClick={cleanFilter}>
          Clear filter
        </Button>
      </FlexColumnCustom>
    </Sidebar>
  );
};

export default LeftSideBar;
