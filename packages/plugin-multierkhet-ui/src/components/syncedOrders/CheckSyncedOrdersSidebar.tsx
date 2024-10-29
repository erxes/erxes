import Datetime from "@nateradebaugh/react-datetime";
import dayjs from "dayjs";
import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormGroup from "@erxes/ui/src/components/form/Group";
import React, { useState } from "react";
import { Sidebar, Wrapper } from "@erxes/ui/src/layout";
import { __, router } from "@erxes/ui/src/utils";
import FormControl from "@erxes/ui/src/components/form/Control";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { useLocation, useNavigate } from "react-router-dom";

const { Section } = Wrapper.Sidebar;

interface IProps {
  queryParams: any;
  posList?: any[];
}

const CheckerSidebar = (props: IProps) => {
  const { queryParams, posList } = props;
  const [posToken, setPosToken] = useState(queryParams.posToken);
  const [search, setSearch] = useState(queryParams.search);
  const [paidStartDate, setPaidStartDate] = useState(queryParams.paidStartDate);
  const [paidEndDate, setPaidEndDate] = useState(queryParams.paidEndDate);
  const [createdStartDate, setCreatedStartDate] = useState(
    queryParams.createdStartDate
  );
  const [createdEndDate, setCreatedEndDate] = useState(
    queryParams.createdEndDate
  );
  const [userId, setUserId] = useState(queryParams.userId);
  const [posId, setPosId] = useState(queryParams.posId);

  const navigate = useNavigate();
  const location = useLocation();

  const onFilter = () => {
    router.setParams(navigate, location, {
      page: 1,
      posToken,
      search,
      pos: posId,
      user: userId,
      paidStartDate,
      paidEndDate,
      createdStartDate,
      createdEndDate,
    });
  };

  const onChangeRangeFilter = (kind, date) => {
    const cDate = dayjs(date).format("YYYY-MM-DD HH:mm");
    if (kind === "paidStartDate") {
      setPaidStartDate(cDate);
    }
    if (kind === "paidEndDate") {
      setPaidEndDate(cDate);
    }
    if (kind === "createdStartDate") {
      setCreatedStartDate(cDate);
    }
    if (kind === "createdEndDate") {
      setCreatedEndDate(cDate);
    }
  };

  const renderRange = (dateType: string) => {
    const lblStart = `${dateType}StartDate`;
    const lblEnd = `${dateType}EndDate`;
    const stateStart = dateType === "paid" ? paidStartDate : createdStartDate;
    const stateEnd = dateType === "paid" ? paidEndDate : createdEndDate;

    return (
      <>
        <FormGroup>
          <ControlLabel>{`${dateType} Date range:`}</ControlLabel>

          <Datetime
            inputProps={{ placeholder: __("Click to select a date") }}
            dateFormat="YYYY-MM-DD"
            timeFormat="HH:mm"
            value={stateStart || null}
            closeOnSelect={true}
            utc={true}
            input={true}
            onChange={onChangeRangeFilter.bind(this, lblStart)}
            viewMode={"days"}
            className={"filterDate"}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{`${dateType} Date range:`}</ControlLabel>
          <Datetime
            inputProps={{ placeholder: __("Click to select a date") }}
            dateFormat="YYYY-MM-DD"
            timeFormat="HH:mm"
            value={stateEnd}
            closeOnSelect={true}
            utc={true}
            input={true}
            onChange={onChangeRangeFilter.bind(this, lblEnd)}
            viewMode={"days"}
            className={"filterDate"}
          />
        </FormGroup>
      </>
    );
  };

  const onChangePosToken = (e: any) => {
    const token = e.target?.value;
    setPosToken(token);
  };

  const onChangeInput = (e: React.FormEvent<HTMLElement>) => {
    const value = (e.currentTarget as HTMLInputElement).value;
    const name = (e.currentTarget as HTMLInputElement).name;

    if (name === "posId") {
      setPosId(value);
    }
    if (name === "search") {
      setSearch(value);
    }
  };

  const onUserChange = (userId) => {
    setUserId(userId);
  };

  return (
    <Wrapper.Sidebar>
      <Sidebar>
        <Section $collapsible={false}>
          <Section.Title>{__("Filters")}</Section.Title>
          <FormGroup>
            <ControlLabel>Enter POS token</ControlLabel>
            <FormControl
              type="text"
              placeholder={__("POS token")}
              onChange={onChangePosToken}
              defaultValue={posToken}
              autoFocus={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Created by</ControlLabel>
            <SelectTeamMembers
              label={__("Choose users")}
              name="userId"
              customOption={{ label: "Choose user", value: "" }}
              initialValue={userId || ""}
              onSelect={onUserChange}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>POS</ControlLabel>
            <FormControl
              name={"posId"}
              componentclass="select"
              defaultValue={posId}
              onChange={onChangeInput}
            >
              <option value="">{__("All")}</option>
              {posList &&
                Array.isArray(posList) &&
                (posList || []).map((pos) => (
                  <option
                    key={pos._id}
                    value={pos._id}
                  >{`${pos.name} - ${pos.description}`}</option>
                ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Number</ControlLabel>
            <FormControl
              type="text"
              name="search"
              onChange={onChangeInput}
              defaultValue={search}
              autoFocus={true}
            />
          </FormGroup>
          {renderRange("paid")}
          {renderRange("created")}
        </Section>

        <Button onClick={onFilter}>Filter</Button>
      </Sidebar>
    </Wrapper.Sidebar>
  );
};

export default CheckerSidebar;
