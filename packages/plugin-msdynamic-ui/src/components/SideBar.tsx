import { __ } from "@erxes/ui/src/utils/core";
import React, { useState } from "react";
import { router } from "@erxes/ui/src/utils";
import { SidebarList as List, Wrapper } from "@erxes/ui/src/layout";
import { CustomRangeContainer, FilterContainer } from "../styles";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { DateContainer } from "@erxes/ui/src/styles/main";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import { EndDateContainer } from "@erxes/ui-forms/src/forms/styles";
import FormControl from "@erxes/ui/src/components/form/Control";
import Button from "@erxes/ui/src/components/Button";
import moment from "moment";
import queryString from "query-string";
import Tip from "@erxes/ui/src/components/Tip";
import Icon from "@erxes/ui/src/components/Icon";
import { useLocation, useNavigate } from "react-router-dom";

type Props = { queryParams: any; loading: boolean };

const { Section } = Wrapper.Sidebar;

const generateQueryParams = (location) => {
  return queryString.parse(location.search);
};

const SideBar = ({ queryParams }: Props) => {
  const [filterParams, setFilterParams] = useState(queryParams);
  const location = useLocation();
  const navigate = useNavigate();

  const isFiltered = (): boolean => {
    const params = generateQueryParams(location);

    for (const param in params) {
      if (["startDate", "endDate", "userId"].includes(param)) {
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
      <FilterContainer>
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
          <CustomRangeContainer>
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
              <EndDateContainer>
                <DateContainer>
                  <DateControl
                    name="endDate"
                    dateFormat="YYYY/MM/DD"
                    timeFormat={true}
                    placeholder="Choose date"
                    value={filterParams.endDate || ""}
                    onChange={(value) => onSelectDate(value, "endDate")}
                  />
                </DateContainer>
              </EndDateContainer>
            </FormGroup>
          </CustomRangeContainer>
          <FormGroup>
            <ControlLabel>Content Type</ControlLabel>
            <FormControl
              name="contentType"
              onChange={(e) =>
                setFilter("contentType", (e.target as any).value)
              }
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
              onChange={(e) =>
                setFilter("searchError", (e.target as any).value)
              }
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
      </FilterContainer>
    </Wrapper.Sidebar>
  );
};

export default SideBar;
