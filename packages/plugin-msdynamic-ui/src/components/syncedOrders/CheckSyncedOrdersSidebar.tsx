import { Alert, __, router } from "@erxes/ui/src/utils";
import { CustomRangeContainer, FilterContainer } from "../../styles";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { DateContainer } from "@erxes/ui/src/styles/main";
import Datetime from "@nateradebaugh/react-datetime";
import { EndDateContainer } from "@erxes/ui-forms/src/forms/styles";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import SelectBrands from "@erxes/ui/src/brands/containers/SelectBrands";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { Wrapper } from "@erxes/ui/src/layout";
import dayjs from "dayjs";

const { Section } = Wrapper.Sidebar;

interface IProps {
  queryParams: any;
  posList?: any[];
}

interface State {
  paidStartDate: Date;
  paidEndDate: Date;
  createdStartDate: Date;
  createdEndDate: Date;
  search: string;
  userId: string;
  brandId: string;
}

const CheckerSidebar = ({ queryParams }: IProps) => {
  const [state, setState] = useState<State>({
    search: queryParams.search,
    paidStartDate: queryParams.paidStartDate,
    paidEndDate: queryParams.paidEndDate,
    createdStartDate: queryParams.createdStartDate,
    createdEndDate: queryParams.createdEndDate,
    userId: queryParams.user,
    brandId: queryParams.brandId,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const onFilter = () => {
    const {
      search,
      userId,
      paidStartDate,
      paidEndDate,
      createdStartDate,
      createdEndDate,
      brandId,
    } = state;

    if (!brandId) {
      return Alert.error("Choose brandId");
    }

    router.setParams(navigate, location, {
      page: 1,
      search,
      user: userId,
      paidStartDate,
      paidEndDate,
      createdStartDate,
      createdEndDate,
      brandId,
    });
  };

  const onChangeRangeFilter = (kind, date) => {
    const cDate = dayjs(date).format("YYYY-MM-DD HH:mm");
    setState((prevState) => ({ ...prevState, [kind]: cDate }));
  };

  const renderRange = (dateType) => {
    const lblStart = `${dateType}StartDate`;
    const lblEnd = `${dateType}EndDate`;

    return (
      <FormGroup>
        <ControlLabel>{`${dateType} Date range:`}</ControlLabel>
        <CustomRangeContainer>
          <DateContainer>
            <Datetime
              inputProps={{ placeholder: __("Choose Date") }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              value={state[lblStart] || null}
              closeOnSelect={true}
              utc={true}
              input={true}
              onChange={(date) => onChangeRangeFilter(lblStart, date)}
              viewMode={"days"}
              className={"filterDate"}
            />
          </DateContainer>
          <EndDateContainer>
            <DateContainer>
              <Datetime
                inputProps={{ placeholder: __("Choose Date") }}
                dateFormat="YYYY-MM-DD"
                timeFormat="HH:mm"
                value={state[lblEnd]}
                closeOnSelect={true}
                utc={true}
                input={true}
                onChange={(date) => onChangeRangeFilter(lblEnd, date)}
                viewMode={"days"}
                className={"filterDate"}
              />
            </DateContainer>
          </EndDateContainer>
        </CustomRangeContainer>
      </FormGroup>
    );
  };

  const onChangeInput = (e: React.FormEvent<HTMLElement>) => {
    const value = (e.currentTarget as HTMLInputElement).value;
    const name = (e.currentTarget as HTMLInputElement).name;
    setState((prevState) => ({ ...prevState, [name]: value }) as any);
  };

  const onUserChange = (userId) => {
    setState((prevState) => ({ ...prevState, userId }));
  };

  const onBrandChange = (brandId) => {
    setState((prevState) => ({ ...prevState, brandId }));
  };

  const { search, userId, brandId } = state;

  return (
    <Wrapper.Sidebar hasBorder={true}>
      <Section.Title>{__("Filters")}</Section.Title>
      <FilterContainer>
        <FormGroup>
          <ControlLabel>Brand</ControlLabel>
          <SelectBrands
            label={__("Choose brands")}
            onSelect={onBrandChange}
            initialValue={brandId}
            multi={false}
            name="selectedBrands"
            customOption={{
              label: "No Brand (noBrand)",
              value: "",
            }}
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
          <ControlLabel>Number</ControlLabel>
          <FormControl
            type="text"
            name="search"
            onChange={onChangeInput}
            value={search}
            autoFocus={true}
          />
        </FormGroup>
        {renderRange("paid")}
        {renderRange("created")}

        <Button
          block={true}
          btnStyle="success"
          uppercase={false}
          onClick={onFilter}
          icon="filter"
        >
          {__("Filter")}
        </Button>
      </FilterContainer>
    </Wrapper.Sidebar>
  );
};

export default CheckerSidebar;
