import ControlLabel from "@erxes/ui/src/components/form/Label";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import moment from "moment";
import queryString from "query-string";
import React, { useState } from "react";
import Tip from "@erxes/ui/src/components/Tip";
import { router } from "@erxes/ui/src/utils";
import { __ } from "coreui/utils";
import { DateContainer } from "@erxes/ui/src/styles/main";
import { SidebarList as List } from "@erxes/ui/src/layout";
import { Wrapper } from "@erxes/ui/src/layout";
import { IQueryParams } from "@erxes/ui/src/types";
import Button from "@erxes/ui/src/components/Button";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import FormControl from "@erxes/ui/src/components/form/Control";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  queryParams: any;
}

const { Section } = Wrapper.Sidebar;

const generateQueryParams = (location) => {
  return queryString.parse(location.search);
};

const SyncHistorySidebar = (props: Props) => {
  const { queryParams } = props;
  const [filterParams, setFilterParams] = useState<IQueryParams>(queryParams);
  const location = useLocation();
  const navigate = useNavigate();

  const isFiltered = (): boolean => {
    const params = generateQueryParams(location);

    for (const param in params) {
      if (["posId", "startDate", "endDate", "userId"].includes(param)) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    const params = generateQueryParams(location);
    router.removeParams(navigate, location, ...Object.keys(params));
  };

  const setFilter = (name, value) => {
    setFilterParams({ ...filterParams, [name]: value });
  };

  const onSelectDate = (value, name) => {
    const strVal = moment(value).format("YYYY-MM-DD HH:mm");
    setFilter(name, strVal);
  };

  const runFilter = () => {
    router.setParams(navigate, location, { ...filterParams, page: 1 });
  };

  return (
    <Wrapper.Sidebar hasBorder>
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
        <FormGroup>
          <ControlLabel>Content Type</ControlLabel>
          <FormControl
            name="contentType"
            onChange={(e) => setFilter("contentType", (e.target as any).value)}
            defaultValue={filterParams.contentType}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Content ID</ControlLabel>
          <FormControl
            name="contentId"
            onChange={(e) => setFilter("contentId", (e.target as any).value)}
            defaultValue={filterParams.contentId}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Search Consume</ControlLabel>
          <FormControl
            name="searchConsume"
            onChange={(e) =>
              setFilter("searchConsume", (e.target as any).value)
            }
            defaultValue={filterParams.searchConsume}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Search Send</ControlLabel>
          <FormControl
            name="searchSend"
            onChange={(e) => setFilter("searchSend", (e.target as any).value)}
            defaultValue={filterParams.searchSend}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Search Response</ControlLabel>
          <FormControl
            name="searchResponse"
            onChange={(e) =>
              setFilter("searchResponse", (e.target as any).value)
            }
            defaultValue={filterParams.searchResponse}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Search Error</ControlLabel>
          <FormControl
            name="searchError"
            onChange={(e) => setFilter("searchError", (e.target as any).value)}
            defaultValue={filterParams.searchError}
          />
        </FormGroup>
      </List>
      <Button
        block={true}
        btnStyle="success"
        uppercase={false}
        onClick={runFilter}
        icon="filter"
      >
        {__("Filter")}
      </Button>
    </Wrapper.Sidebar>
  );
};

export default SyncHistorySidebar;
