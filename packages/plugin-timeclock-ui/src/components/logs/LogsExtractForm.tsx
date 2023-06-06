import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import {
  CustomRangeContainer,
  FlexCenter,
  FlexColumnCustom,
  MarginY,
  ToggleDisplay
} from '../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { ControlLabel } from '@erxes/ui/src/components/form';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import Select from 'react-select-plus';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

type Props = {
  departments: IDepartment[];
  branches: IBranch[];

  extractTimeLogsFromMsSQL: (
    startDate: Date,
    endDate: Date,
    values: any
  ) => void;
};

const extractForm = (props: Props) => {
  const { departments, branches, extractTimeLogsFromMsSQL } = props;

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

  const [startDate, setStartDate] = useState(
    new Date(localStorage.getItem('startDate') || Date.now())
  );
  const [endDate, setEndDate] = useState(
    new Date(localStorage.getItem('endDate') || Date.now())
  );

  const onStartDateChange = dateVal => {
    setStartDate(dateVal);
    localStorage.setItem('startDate', startDate.toISOString());
  };

  const onEndDateChange = dateVal => {
    setEndDate(dateVal);
    localStorage.setItem('endDate', endDate.toISOString());
  };

  const extractAllData = () => {
    extractTimeLogsFromMsSQL(startDate, endDate, {
      branchIds: selectedBranches,
      departmentIds: selectedDepartments,
      userIds: currUserIds,
      extractAll: extractType === 'All team members'
    });
  };

  const extractContent = () => (
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

  return extractContent();
};

export default extractForm;
