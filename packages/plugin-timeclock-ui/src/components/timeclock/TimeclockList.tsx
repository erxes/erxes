import Button from '@erxes/ui/src/components/Button';
import { ITimeclock } from '../../types';
import Row from './TimeclockRow';
import { Alert, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import TimeForm from '../../containers/timeclock/TimeFormList';
import {
  CustomRangeContainer,
  FlexCenter,
  FlexColumnCustom,
  FlexRowLeft,
  MarginY,
  TextAlignCenter,
  ToggleButton,
  ToggleDisplay
} from '../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { ControlLabel } from '@erxes/ui/src/components/form';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { IUser } from '@erxes/ui/src/auth/types';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import Icon from '@erxes/ui/src/components/Icon';
import Select from 'react-select-plus';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { prepareCurrentUserOption } from '../../utils';
import * as dayjs from 'dayjs';

type Props = {
  currentUser: IUser;
  departments: IDepartment[];
  branches: IBranch[];

  queryParams: any;
  history: any;
  startTime?: Date;
  timeclocks: ITimeclock[];
  loading: boolean;
  totalCount: number;

  isCurrentUserAdmin: boolean;

  startClockTime?: (userId: string) => void;
  extractAllMsSqlData: (startDate: Date, endDate: Date, params: any) => void;
  removeTimeclock: (_id: string) => void;

  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  getPagination: (pagination: any) => void;
};

function List(props: Props) {
  const {
    isCurrentUserAdmin,
    currentUser,
    departments,
    branches,
    queryParams,
    timeclocks,
    totalCount,
    startClockTime,
    extractAllMsSqlData,
    removeTimeclock,
    getActionBar,
    showSideBar,
    getPagination
  } = props;

  const [extractType, setExtractType] = useState('All team members');
  const [currUserIds, setUserIds] = useState([]);

  const [selectedBranches, setBranches] = useState<string[]>([]);
  const [selectedDepartments, setDepartments] = useState<string[]>([]);

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

  const onBranchSelect = el => {
    const selectedBranchIds: string[] = [];
    selectedBranchIds.push(...el.map(branch => branch.value));
    setBranches(selectedBranchIds);
  };

  const onDepartmentSelect = el => {
    const selectedDeptIds: string[] = [];
    selectedDeptIds.push(...el.map(dept => dept.value));
    setDepartments(selectedDeptIds);
  };

  const onMemberSelect = selectedUsers => {
    setUserIds(selectedUsers);
  };

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

  const trigger = (
    <Button btnStyle={'success'} icon="plus-circle">
      Start Shift
    </Button>
  );

  const [startDate, setStartDate] = useState(
    new Date(localStorage.getItem('startDate') || Date.now())
  );
  const [endDate, setEndDate] = useState(
    new Date(localStorage.getItem('endDate') || Date.now())
  );

  const extractTrigger = isCurrentUserAdmin ? (
    <Button icon="plus-circle">Extract all data</Button>
  ) : (
    <></>
  );

  const [isSideBarOpen, setIsOpen] = useState(
    localStorage.getItem('isSideBarOpen') === 'true' ? true : false
  );

  const onToggleSidebar = () => {
    const toggleIsOpen = !isSideBarOpen;
    setIsOpen(toggleIsOpen);
    localStorage.setItem('isSideBarOpen', toggleIsOpen.toString());
  };

  const modalContent = contenProps => (
    <TimeForm
      {...contenProps}
      {...props}
      startClockTime={startClockTime}
      timeclocks={timeclocks}
    />
  );

  const onStartDateChange = dateVal => {
    if (checkDateRange(dateVal, endDate)) {
      setStartDate(dateVal);
      localStorage.setItem('startDate', startDate.toISOString());
    }
  };

  const onEndDateChange = dateVal => {
    if (checkDateRange(startDate, dateVal)) {
      setEndDate(dateVal);
      localStorage.setItem('endDate', endDate.toISOString());
    }
  };

  const checkDateRange = (start: Date, end: Date) => {
    if ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) > 8) {
      Alert.error('Please choose date range within 8 days');
      return false;
    }

    return true;
  };

  const extractAllData = () => {
    if (checkDateRange(startDate, endDate)) {
      extractAllMsSqlData(startDate, endDate, {
        branchIds: selectedBranches,
        departmentIds: selectedDepartments,
        userIds: currUserIds,
        extractAll: extractType === 'All team members'
      });
    }
  };
  const extractContent = contentProps => (
    <FlexColumnCustom marginNum={10}>
      <div>
        <ControlLabel>Select Date Range</ControlLabel>
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
        </CustomRangeContainer>
      </div>

      <Select
        value={extractType}
        onChange={el => setExtractType(el.value)}
        placeholder="Select extract type"
        options={['All team members', 'Choose team members'].map(e => ({
          value: e,
          label: e
        }))}
      />

      <ToggleDisplay display={extractType === 'Choose team members'}>
        <div>
          <ControlLabel>Departments</ControlLabel>
          <Select
            value={selectedDepartments}
            onChange={onDepartmentSelect}
            placeholder="Select departments"
            multi={true}
            options={departments && renderDepartmentOptions(departments)}
          />
        </div>
        <div>
          <ControlLabel>Branches</ControlLabel>
          <Select
            value={selectedBranches}
            onChange={onBranchSelect}
            placeholder="Select branches"
            multi={true}
            options={branches && renderBranchOptions(branches)}
          />
        </div>
        <div>
          <ControlLabel>Team members</ControlLabel>
          <SelectTeamMembers
            initialValue={currUserIds}
            customField="employeeId"
            label="Select team member"
            name="userIds"
            customOption={prepareCurrentUserOption(currentUser)}
            filterParams={filterParams}
            onSelect={onMemberSelect}
          />
        </div>
      </ToggleDisplay>

      <MarginY margin={10}>
        <FlexCenter>
          <Button onClick={extractAllData}>Extract all data</Button>
        </FlexCenter>
      </MarginY>
    </FlexColumnCustom>
  );

  const actionBarLeft = (
    <FlexRowLeft>
      <ToggleButton
        id="btn-inbox-channel-visible"
        isActive={isSideBarOpen}
        onClick={onToggleSidebar}
      >
        <Icon icon="subject" />
      </ToggleButton>

      <Title capitalize={true}>
        {__(new Date().toDateString().slice(0, -4))}
      </Title>
    </FlexRowLeft>
  );

  const actionBarRight = (
    <>
      {!isEnabled('bichil') && (
        <ModalTrigger
          title={__('Extract all data')}
          trigger={extractTrigger}
          content={extractContent}
        />
      )}
      <ModalTrigger
        title={__('Start shift')}
        trigger={trigger}
        content={modalContent}
      />
    </>
  );

  const actionBar = (
    <Wrapper.ActionBar
      left={actionBarLeft}
      right={actionBarRight}
      hasFlex={true}
      wideSpacing={true}
    />
  );

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Team member')}</th>
          <th>{__('Shift date')}</th>
          <th>{__('Check In')}</th>
          <th>{__('In Device')}</th>
          <th>{__('Location')}</th>
          <th>{__('Check Out')}</th>
          <th>{__('Overnight')}</th>
          <th>{__('Out Device')}</th>
          <th>{__('Location')}</th>
          <th>
            <TextAlignCenter>{__('Action')}</TextAlignCenter>
          </th>
        </tr>
      </thead>
      <tbody>
        {timeclocks.map(timeclock => {
          return (
            <Row
              isCurrentUserAdmin={isCurrentUserAdmin}
              key={timeclock._id}
              timeclock={timeclock}
              removeTimeclock={removeTimeclock}
            />
          );
        })}
      </tbody>
    </Table>
  );

  getActionBar(actionBar);
  showSideBar(isSideBarOpen);
  getPagination(<Pagination count={totalCount} />);

  return content;
}

export default List;
