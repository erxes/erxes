import ControlLabel from "@erxes/ui/src/components/form/Label";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import moment from "moment";
import React, { useState } from "react";
import Tip from "@erxes/ui/src/components/Tip";
import { router } from "@erxes/ui/src/utils";
import { __ } from "@erxes/ui/src";
import { DateContainer } from "@erxes/ui/src/styles/main";
import { MenuFooter } from "../../styles";
import { SidebarList as List } from "@erxes/ui/src/layout";
import { Wrapper } from "@erxes/ui/src/layout";
import { IQueryParams } from "@erxes/ui/src/types";
import Button from "@erxes/ui/src/components/Button";
import SelectPos from "./SelectPos";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

const { Section } = Wrapper.Sidebar;

const CoverSidebar = (props: Props) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const [filterParams, setFilterParams] = useState<IQueryParams>(
    queryParams || {}
  );

  const isFiltered = (): boolean => {
    for (const param in queryParams) {
      if (["posId", "startDate", "endDate", "userId"].includes(param)) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    router.removeParams(navigate, location, ...Object.keys(queryParams));
  };

  const setFilter = (name, value) => {
    setFilterParams((prevState) => ({ ...prevState, [name]: value }));
  };

  const onchangeType = (e) => {
    const value = (e.currentTarget as HTMLInputElement).value;

    const filters: IQueryParams = {
      ...filterParams,
      type: value,
    };

    delete filters.jobReferId;
    delete filters.productIds;
    delete filters.productCategoryId;

    setFilterParams(filters);
  };

  const onSelectDate = (value, name) => {
    const strVal = moment(value).format("YYYY-MM-DD HH:mm");
    setFilter(name, strVal);
  };

  const runFilter = () => {
    router.setParams(navigate, location, { ...filterParams, page: 1 });
  };

  return (
    <Wrapper.Sidebar hasBorder={true}>
      <Section.Title>
        {__("Filters")}
        <Section.QuickButtons>
          {isFiltered() && (
            <a href="#cancel" tabIndex={0} onClick={clearFilter}>
              <Tip text={__("Clear filter")} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </Section.QuickButtons>
      </Section.Title>
      <List id="SettingsSidebar">
        <FormGroup>
          <ControlLabel>{__("POS")}</ControlLabel>
          <SelectPos
            label={__("Choose pos")}
            name="posId"
            initialValue={filterParams.posId}
            onSelect={(posId) => setFilter("posId", posId)}
            customOption={{ value: "", label: "...Clear user filter" }}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>User</ControlLabel>
          <SelectTeamMembers
            label={__("Choose users")}
            name="userId"
            initialValue={filterParams.userId}
            onSelect={(userId) => setFilter("userId", userId)}
            customOption={{ value: "", label: "...Clear user filter" }}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__(`Start Date`)}</ControlLabel>
          <DateContainer>
            <DateControl
              name="startDate"
              dateFormat="YYYY/MM/DD"
              timeFormat={true}
              placeholder={__("Choose date")}
              value={filterParams.startDate || ""}
              onChange={(value) => onSelectDate(value, "startDate")}
            />
          </DateContainer>
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__(`End Date`)}</ControlLabel>
          <DateContainer>
            <DateControl
              name="endDate"
              dateFormat="YYYY/MM/DD"
              timeFormat={true}
              placeholder={__("Choose date")}
              value={filterParams.endDate || ""}
              onChange={(value) => onSelectDate(value, "endDate")}
            />
          </DateContainer>
        </FormGroup>
      </List>
      <MenuFooter>
        <Button
          block={true}
          btnStyle="success"
          uppercase={false}
          onClick={runFilter}
          icon="filter"
        >
          {__("Filter")}
        </Button>
      </MenuFooter>
    </Wrapper.Sidebar>
  );
};

export default CoverSidebar;
