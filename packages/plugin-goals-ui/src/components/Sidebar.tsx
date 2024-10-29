import React, { useState } from "react";
import { __, router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import SelectUnits from "@erxes/ui/src/team/containers/SelectUnits";
import { SidebarFilters } from "../styles";
import Tip from "@erxes/ui/src/components/Tip";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import dayjs from "dayjs";

type Props = {
  params: any;
};

const { Section } = Wrapper.Sidebar;

const Sidebar = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState(props.params);
  const { branch, department, unit, startDate, contribution, endDate } =
    filters;

  const clearFilter = () => {
    router.removeParams(
      navigate,
      location,
      "branch",
      "department",
      "unit",
      "contribution",
      "startDate",
      "endDate",
      "page"
    );
  };

  const runFilter = () => {
    router.setParams(navigate, location, { ...filters });
  };

  const setFilter = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  return (
    <Wrapper.Sidebar hasBorder={true}>
      <Section.Title>
        {__("Filters")}
        <Section.QuickButtons>
          {!!Object.keys(props.params).length && (
            <a href="#cancel" tabIndex={0} onClick={clearFilter}>
              <Tip text={__("Clear filter")} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </Section.QuickButtons>
      </Section.Title>
      <SidebarFilters>
        <FormGroup>
          <ControlLabel>Start Date</ControlLabel>
          <DateControl
            value={startDate || ""}
            name="startDate"
            placeholder={__("Start Date")}
            dateFormat={"YYYY-MM-DD"}
            onChange={(startDate: any) =>
              setFilter("startDate", dayjs(startDate).format("YYYY-MM-DD"))
            }
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>End Date</ControlLabel>
          <DateControl
            value={endDate || ""}
            name="endDate"
            placeholder={__("End Date")}
            dateFormat={"YYYY-MM-DD"}
            onChange={(endDate: any) =>
              setFilter("endDate", dayjs(endDate).format("YYYY-MM-DD"))
            }
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Branch</ControlLabel>
          <SelectBranches
            label={__("Choose branch")}
            name="branch"
            initialValue={branch || ""}
            customOption={{
              value: "",
              label: __("...Clear branch filter"),
            }}
            onSelect={(branch) => setFilter("branch", branch)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Department</ControlLabel>
          <SelectDepartments
            label={__("Choose department")}
            name="department"
            initialValue={department || ""}
            customOption={{
              value: "",
              label: __("...Clear department filter"),
            }}
            onSelect={(department) => setFilter("department", department)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Units</ControlLabel>
          <SelectUnits
            label={__("Choose Units")}
            name="unit"
            initialValue={unit || ""}
            customOption={{
              value: "",
              label: __("...Clear unit filter"),
            }}
            onSelect={(unit) => setFilter("unit", unit)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>TeamMember</ControlLabel>
          <SelectTeamMembers
            label={__("Choose User")}
            name="contribution"
            initialValue={contribution || ""}
            customOption={{
              value: "",
              label: __("...Clear user filter"),
            }}
            onSelect={(contribution) => setFilter("contribution", contribution)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <Button onClick={runFilter}>Filter</Button>
        </FormGroup>
      </SidebarFilters>
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
