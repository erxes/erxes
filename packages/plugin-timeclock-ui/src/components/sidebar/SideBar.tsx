import {
  FlexColumnCustom,
  FlexRow,
  SidebarActions,
  SidebarHeader,
  Trigger
} from '../../styles';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import React, { useEffect, useState } from 'react';
import { __, router } from '@erxes/ui/src/utils';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { CustomRangeContainer } from '../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { IUser } from '@erxes/ui/src/auth/types';
import Select from 'react-select';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { prepareCurrentUserOption } from '../../utils';

type Props = {
  currentUser: IUser;
  isCurrentUserAdmin: boolean;

  queryParams: any;
  branches: IBranch[];
  departments: IDepartment[];
};

const NOW = new Date();
// get 1st of the next Month
const startOfNextMonth = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 1);
// get 1st of this month
const startOfThisMonth = new Date(NOW.getFullYear(), NOW.getMonth(), 1);

const LeftSideBar = (props: Props) => {
  const {
    branches,
    queryParams,
    departments,
    currentUser,
    isCurrentUserAdmin
  } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const [currUserIds, setUserIds] = useState(queryParams.userIds);

  const [selectedBranches, setBranches] = useState(queryParams.branchIds || '');
  const [selectedDepartments, setDepartments] = useState(
    queryParams.departmentIds || ''
  );

  const [isHovered, setIsHovered] = useState(false);
  const [currentDateOption, setCurrentDateOption] = useState('thisMonth');

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseLeave = () => {
    setIsHovered(false);
  };

  const dateOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'This Month', value: 'thisMonth' }
  ];

  useEffect(() => {
    resetParams();
  }, []);

  const returnTotalUserOptions = () => {
    const totalUserOptions: string[] = [];

    for (const dept of departments) {
      totalUserOptions.push(...dept.userIds);
    }

    for (const branch of branches) {
      totalUserOptions.push(...branch.userIds);
    }

    totalUserOptions.push(currentUser._id);

    return totalUserOptions;
  };

  const filterParams = isCurrentUserAdmin
    ? {}
    : {
        ids: returnTotalUserOptions(),
        excludeIds: false
      };

  const [startDate, setStartDate] = useState(
    queryParams.startDate || startOfThisMonth
  );
  const [endDate, setEndDate] = useState(
    queryParams.endDate || startOfNextMonth
  );

  const cleanFilter = () => {
    resetParams();
  };

  const resetParams = () => {
    setBranches([]);
    setDepartments([]);
    setUserIds([]);
    setStartDate(startOfThisMonth);
    setEndDate(startOfNextMonth);

    router.setParams(navigate, location, {
      branchIds: [],
      departmentIds: [],
      userIds: [],
      startDate: startOfThisMonth,
      endDate: startOfNextMonth
    });
  };

  const setParams = (key: string, value: any) => {
    if (value) {
      // removePageParams();
      router.setParams(navigate, location, {
        [key]: value
      });
    }
  };

  const renderDepartmentOptions = (depts: IDepartment[]) => {
    return depts.map(dept => ({
      value: dept._id,
      label: dept.title,
      userIds: dept.userIds
    }));
  };

  const renderBranchOptions = (branchesList: IBranch[]) => {
    return branchesList.map(branch => ({
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

    setParams('branchIds', selectedBranchIds);
  };

  const onDepartmentSelect = selectedDepartment => {
    setDepartments(selectedDepartment);

    const selectedDepartmentIds: string[] = [];

    selectedDepartment.map(department => {
      selectedDepartmentIds.push(department.value);
    });

    setParams('departmentIds', selectedDepartmentIds);
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
    );
  };

  const renderSidebarHeader = () => {
    return <SidebarActions>{renderSidebarActions()}</SidebarActions>;
  };

  const onDateButtonClick = (type: string) => {
    setCurrentDateOption(type);
    if (type === 'today') {
      const startOfToday = new Date(NOW.setHours(0, 0, 0, 0));
      const endOfToday = new Date(NOW.setHours(23, 59, 59, 999));
      setStartDate(startOfToday);
      setEndDate(endOfToday);
      setParams('startDate', startOfToday);
      setParams('endDate', endOfToday);
    }

    if (type === 'thisMonth') {
      const endOfThisMonth = new Date(startOfNextMonth.getTime() - 1);

      setStartDate(startOfThisMonth);
      setParams('startDate', startOfThisMonth);

      setEndDate(endOfThisMonth);
      setParams('endDate', endOfThisMonth);
    }

    if (type === 'thisWeek') {
      const startOfThisWeek = new Date(NOW.setHours(0, 0, 0, 0));
      const endOfThisWeek = new Date(NOW.setHours(23, 59, 59, 999));

      // Set the date to the beginning of the current week (Monday)
      startOfThisWeek.setDate(NOW.getDate() - NOW.getDay() + 1);

      // Set the date to the end of the week (Sunday)
      endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);

      setStartDate(startOfThisWeek);
      setParams('startDate', startOfThisWeek);

      setEndDate(endOfThisWeek);
      setParams('endDate', endOfThisWeek);
    }
  };

  const renderDateFilterMenu = () => {
    return (
      <Trigger
        type='trigger'
        $isHoverActionBar={isHovered}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}>
        {dateOptions.map(d => {
          return (
            <div
              key={d.value}
              className={d.value === currentDateOption ? 'active' : 'passive'}
              onClick={() => onDateButtonClick(d.value)}>
              {d.label}
            </div>
          );
        })}
      </Trigger>
    );
  };

  return (
    <Sidebar wide={true} hasBorder={true} header={renderSidebarHeader()}>
      <FlexColumnCustom
        $marginNum={20}
        style={{ gap: '1rem', padding: '1rem' }}>
        {renderDateFilterMenu()}
        <div>
          <ControlLabel>Departments</ControlLabel>
          <Select
            value={selectedDepartments}
            onChange={onDepartmentSelect}
            placeholder='Select departments'
            isMulti={true}
            options={departments && renderDepartmentOptions(departments)}
          />
        </div>
        <div>
          <ControlLabel>Branches</ControlLabel>
          <Select
            value={selectedBranches}
            onChange={onBranchSelect}
            placeholder='Select branches'
            isMulti={true}
            options={branches && renderBranchOptions(branches)}
          />
        </div>
        <div>
          <ControlLabel>Team members</ControlLabel>
          <SelectTeamMembers
            initialValue={currUserIds}
            customField='employeeId'
            label='Select team member'
            name='userIds'
            customOption={prepareCurrentUserOption(currentUser)}
            filterParams={filterParams}
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
