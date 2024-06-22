import ControlLabel from "@erxes/ui/src/components/form/Label";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import moment from "moment";
import React, { useRef } from "react";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectLabels from "../../settings/containers/SelectLabels";
import Tip from "@erxes/ui/src/components/Tip";
import { __, router } from "@erxes/ui/src/utils";
import { DateContainer } from "@erxes/ui/src/styles/main";
import { SidebarFilters } from "../../styles";
import { SidebarList as List } from "@erxes/ui/src/layout";
import { Wrapper } from "@erxes/ui/src/layout";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

const { Section } = Wrapper.Sidebar;

const DayLabelSidebar = (props: Props) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const timerRef = useRef<number | null>(null);

  const clearFilter = () => {
    router.removeParams(
      navigate,
      location,
      "date",
      "filterStatus",
      "branchId",
      "departmentId",
      "labelId"
    );
  };

  const setFilter = (name, value) => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { [name]: value });
  };

  const onInputChange = (e) => {
    e.preventDefault();

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const value = e.target.value;
    const name = e.target.name;
    timerRef.current = window.setTimeout(() => {
      setFilter(name, value);
    }, 500);
  };

  const onSelectDate = (value) => {
    const strVal = moment(value).format("YYYY/MM/DD");
    setFilter("date", strVal);
  };

  const handleStatusSelect = (name, selectedOption) => {
    setFilter(name, selectedOption.value);
  };

  const statusOptions = [
    {
      label: "All status",
      value: "",
    },
    {
      label: "Active",
      value: "active",
    },
    {
      label: "Archived",
      value: "archived",
    },
  ];

  return (
    <Wrapper.Sidebar hasBorder={true}>
      <Section.Title>
        {__("Filters")}
        <Section.QuickButtons>
          {(router.getParam(location, "filterStatus") ||
            router.getParam(location, "branchId") ||
            router.getParam(location, "departmentId") ||
            router.getParam(location, "date") ||
            router.getParam(location, "labelId")) && (
            <a href="#cancel" tabIndex={0} onClick={clearFilter}>
              <Tip text={__("Clear filter")} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </Section.QuickButtons>
      </Section.Title>
      <SidebarFilters>
        <List id="SettingsSidebar">
          <FormGroup>
            <ControlLabel required={true}>{__(`Date`)}</ControlLabel>
            <DateContainer>
              <DateControl
                name="createdAtFrom"
                placeholder="Choose date"
                value={queryParams.date || ""}
                onChange={onSelectDate}
              />
            </DateContainer>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Branch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="branchId"
              initialValue={queryParams.branchId || ""}
              customOption={{
                value: "",
                label: "...Clear branch filter",
              }}
              onSelect={(branchId) => setFilter("branchId", branchId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Department</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="departmentId"
              initialValue={queryParams.departmentId || ""}
              customOption={{
                value: "",
                label: "...Clear department filter",
              }}
              onSelect={(departmentId) =>
                setFilter("departmentId", departmentId)
              }
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Label</ControlLabel>
            <SelectLabels
              label="Choose label"
              name="labelId"
              initialValue={queryParams.labelId || ""}
              customOption={{
                value: "",
                label: "...Clear label filter",
              }}
              onSelect={(labelId) => setFilter("labelId", labelId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Status</ControlLabel>
            <Select
              name="filterStatus"
              value={statusOptions.find(
                (o) => o.value === (queryParams.filterStatus || "")
              )}
              onChange={(option) => handleStatusSelect("filterStatus", option)}
              options={statusOptions}
              isClearable={false}
            />
          </FormGroup>
        </List>
      </SidebarFilters>
    </Wrapper.Sidebar>
  );
};

export default DayLabelSidebar;
