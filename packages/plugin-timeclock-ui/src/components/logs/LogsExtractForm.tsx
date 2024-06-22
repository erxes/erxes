import { Alert, __ } from "@erxes/ui/src/utils";
import {
  CustomRangeContainer,
  FlexCenter,
  FlexColumnCustom,
  MarginY,
  ToggleDisplay,
} from "../../styles";
import { IBranch, IDepartment } from "@erxes/ui/src/team/types";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import { ControlLabel } from "@erxes/ui/src/components/form";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import Select from "react-select";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";

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

  const [extractType, setExtractType] = useState("All team members");
  const [currUserIds, setUserIds] = useState([]);

  const [selectedBranches, setBranches] = useState<string[]>([]);
  const [selectedDepartments, setDepartments] = useState<string[]>([]);

  const [startDate, setStartDate] = useState(
    new Date(localStorage.getItem("startDate") || Date.now())
  );
  const [endDate, setEndDate] = useState(
    new Date(localStorage.getItem("endDate") || Date.now())
  );

  const renderDepartmentOptions = (depts: IDepartment[]) => {
    return depts.map((dept) => ({
      value: dept._id,
      label: dept.title,
      userIds: dept.userIds,
    }));
  };

  const renderBranchOptions = (branchesList: IBranch[]) => {
    return branchesList.map((branch) => ({
      value: branch._id,
      label: branch.title,
      userIds: branch.userIds,
    }));
  };

  const onBranchSelect = (el) => {
    const selectedBranchIds: string[] = [];
    selectedBranchIds.push(...el.map((branch) => branch.value));
    setBranches(selectedBranchIds);
  };

  const onDepartmentSelect = (el) => {
    const selectedDeptIds: string[] = [];
    selectedDeptIds.push(...el.map((dept) => dept.value));
    setDepartments(selectedDeptIds);
  };

  const onMemberSelect = (selectedUsers) => {
    setUserIds(selectedUsers);
  };

  const onStartDateChange = (dateVal) => {
    if (checkDateRange(dateVal, endDate)) {
      setStartDate(dateVal);
      localStorage.setItem("startDate", startDate.toISOString());
    }
  };

  const onEndDateChange = (dateVal) => {
    if (checkDateRange(startDate, dateVal)) {
      setEndDate(dateVal);
      localStorage.setItem("endDate", endDate.toISOString());
    }
  };

  const extractAllData = () => {
    if (checkDateRange(startDate, endDate)) {
      extractTimeLogsFromMsSQL(startDate, endDate, {
        branchIds: selectedBranches,
        departmentIds: selectedDepartments,
        userIds: currUserIds,
        extractAll: extractType === "All team members",
      });
    }
  };

  const checkDateRange = (start: Date, end: Date) => {
    if ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) > 8) {
      Alert.error("Please choose date range within 8 days");
      return false;
    }

    return true;
  };

  const extractOptions = ["All team members", "Choose team members"].map(
    (e) => ({
      value: e,
      label: e,
    })
  );

  const extractContent = () => (
    <FlexColumnCustom $marginNum={10}>
      <div>
        <ControlLabel>Select Date Range</ControlLabel>
        <CustomRangeContainer>
          <DateControl
            required={false}
            value={startDate}
            name="startDate"
            placeholder={"Starting date"}
            dateFormat={"YYYY-MM-DD"}
            onChange={onStartDateChange}
          />
          <DateControl
            required={false}
            value={endDate}
            name="endDate"
            placeholder={"Ending date"}
            dateFormat={"YYYY-MM-DD"}
            onChange={onEndDateChange}
          />
        </CustomRangeContainer>
      </div>

      <Select
        value={extractOptions.find((o) => o.value === extractType)}
        onChange={(el: any) => setExtractType(el.value)}
        placeholder="Select extract type"
        options={extractOptions}
        isClearable={true}
      />

      <ToggleDisplay display={extractType === "Choose team members"}>
        <div>
          <ControlLabel>Departments</ControlLabel>
          <Select
            value={
              departments &&
              renderDepartmentOptions(departments).filter((o) =>
                selectedDepartments.includes(o.value)
              )
            }
            onChange={onDepartmentSelect}
            placeholder="Select departments"
            isMulti={true}
            options={departments && renderDepartmentOptions(departments)}
          />
        </div>
        <div>
          <ControlLabel>Branches</ControlLabel>
          <Select
            value={
              branches &&
              renderBranchOptions(branches).filter((o) =>
                selectedBranches.includes(o.value)
              )
            }
            onChange={onBranchSelect}
            placeholder="Select branches"
            isMulti={true}
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
          <Button btnStyle="primary" onClick={extractAllData}>
            Extract all data
          </Button>
        </FlexCenter>
      </MarginY>
    </FlexColumnCustom>
  );

  return extractContent();
};

export default extractForm;
