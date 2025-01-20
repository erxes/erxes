import { ALLOW_STATUSES, ALLOW_TYPES } from "../../constants";
import {
  Button,
  ControlLabel,
  FormControl,
  Icon,
  SelectTeamMembers
} from "@erxes/ui/src";
import {
  CustomRangeContainer,
  FilterBox,
  FilterButton,
  MenuFooter,
  RightMenuContainer,
  TabContent
} from "../../styles";
import React, { useRef, useState } from "react";
import { __, isEnabled } from "@erxes/ui/src/utils/core";

import { CSSTransition } from "react-transition-group";
import Datetime from "@nateradebaugh/react-datetime";
import { IQueryParams } from "@erxes/ui/src/types";
import Select from "react-select";
import SelectPos from "./SelectPos";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import dayjs from "dayjs";

const SelectCustomers = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SelectCustomers" */ "@erxes/ui-contacts/src/customers/containers/SelectCustomers"
    )
);

const SelectCompanies = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SelectCustomers" */ "@erxes/ui-contacts/src/companies/containers/SelectCompanies"
    )
);

type Props = {
  onSearch: (search: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  queryParams: any;
  isFiltered: boolean;
  clearFilter: () => void;
};

const RightMenu = (props: Props) => {
  const { isFiltered, queryParams, onFilter, onSearch, onSelect, clearFilter } =
    props;

  const wrapperRef = useRef(null);

  const [currentTab, setCurrentTab] = useState<string>("Filter");
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [filterParams, setFilterParams] = useState<IQueryParams>(
    queryParams || {}
  );

  const setFilter = () => {
    onFilter(filterParams);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleSearch = (e: React.KeyboardEvent<Element>) => {
    if (e.key === "Enter") {
      const target = e.currentTarget as HTMLInputElement;
      onSearch(target.value || "");
    }
  };

  const handleSelect = (values: string[] | string, key: string) => {
    setFilterParams(prevState => ({ ...prevState, [key]: String(values) }));
  };

  const onChangeInput = e => {
    const target = e.target;
    const name = target.name;
    const value = target.value;

    setFilterParams(prevState => ({ ...prevState, [name]: value }));
  };

  const renderLink = (label: string, key: string, value: string) => {
    const selected = queryParams[key] === value;

    const onClick = _e => {
      onSelect(value, key);
    };

    return (
      <FilterButton selected={selected} onClick={onClick}>
        {__(label)}
        {selected && <Icon icon="check-1" size={14} />}
      </FilterButton>
    );
  };

  const onChangeRangeFilter = (kind, date) => {
    const cDate = dayjs(date).format("YYYY-MM-DD HH:mm");
    setFilterParams(prevState => ({ ...prevState, [kind]: cDate }));
  };

  const renderSpecials = () => {
    return (
      <>
        {renderLink("Only Today", "paidDate", "today")}
        {renderLink("Only Me", "userId", "me")}
        {renderLink("No Pos", "userId", "nothing")}
      </>
    );
  };

  const renderRange = (dateType: string) => {
    const lblStart = `${dateType}StartDate`;
    const lblEnd = `${dateType}EndDate`;

    return (
      <>
        <ControlLabel>{`${dateType} Date range:`}</ControlLabel>

        <CustomRangeContainer>
          <div className="input-container">
            <Datetime
              inputProps={{ placeholder: __("Click to select a date") }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              value={filterParams[lblStart]}
              closeOnSelect={true}
              utc={true}
              input={true}
              onChange={onChangeRangeFilter.bind(this, lblStart)}
              viewMode={"days"}
              className={"filterDate"}
            />
          </div>

          <div className="input-container">
            <Datetime
              inputProps={{ placeholder: __("Click to select a date") }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              value={filterParams[lblEnd]}
              closeOnSelect={true}
              utc={true}
              input={true}
              onChange={onChangeRangeFilter.bind(this, lblEnd)}
              viewMode={"days"}
              className={"filterDate"}
            />
          </div>
        </CustomRangeContainer>
      </>
    );
  };

  const renderFilter = () => {
    return (
      <FilterBox>
        <FormControl
          name={"search"}
          defaultValue={filterParams.search}
          placeholder={__("Number ...")}
          onKeyPress={handleSearch}
          autoFocus={true}
          onChange={onChangeInput}
        />

        <SelectCustomers
          label={__("Filter by customer")}
          name="customerId"
          initialValue={filterParams.customerId}
          onSelect={handleSelect}
          customOption={{ value: "", label: __("...Clear customer filter") }}
          multi={false}
        />
        <SelectCompanies
          label={__("Filter by company")}
          name="customerId"
          initialValue={filterParams.customerId}
          onSelect={handleSelect}
          customOption={{ value: "", label: __("...Clear company filter") }}
          multi={false}
        />

        <SelectTeamMembers
          label="Choose users"
          name="userId"
          initialValue={filterParams.userId}
          onSelect={handleSelect}
          customOption={{ value: "", label: "...Clear user filter" }}
          multi={false}
        />

        <SelectPos
          label={__("Choose pos")}
          name="posId"
          initialValue={filterParams.posId}
          onSelect={handleSelect}
          customOption={{ value: "", label: "...Clear user filter" }}
          multi={false}
        />

        <Select
          name={"types"}
          isMulti={true}
          placeholder={__("Choose types")}
          value={
            filterParams.types
              ? ALLOW_TYPES.filter(o => filterParams.types.includes(o.value))
              : null
          }
          onChange={types => {
            handleSelect(
              (types || []).map(t => t.value),
              "types"
            );
          }}
          options={ALLOW_TYPES}
        />

        <Select
          name={"statuses"}
          isMulti={true}
          placeholder={__("Choose status")}
          value={
            filterParams.statuses
              ? ALLOW_STATUSES.filter(o =>
                  filterParams.statuses.includes(o.value)
                )
              : null
          }
          onChange={statuses => {
            handleSelect(
              (statuses || []).map(t => t.value),
              "statuses"
            );
          }}
          options={ALLOW_STATUSES}
        />

        <Select
          name={"excludeStatuses"}
          isMulti={true}
          placeholder={__("Exclude status")}
          value={
            filterParams.excludeStatuses
              ? ALLOW_STATUSES.filter(o =>
                  filterParams.excludeStatuses.includes(o.value)
                )
              : null
          }
          onChange={statuses => {
            handleSelect(
              (statuses || []).map(t => t.value),
              "excludeStatuses"
            );
          }}
          options={ALLOW_STATUSES}
        />

        {renderRange("created")}
        {renderRange("paid")}

        {renderSpecials()}
      </FilterBox>
    );
  };

  const renderTabContent = () => {
    return (
      <>
        <TabContent>{renderFilter()}</TabContent>
        <MenuFooter>
          <Button
            block={true}
            btnStyle="success"
            uppercase={false}
            onClick={setFilter}
            icon="filter"
          >
            {__("Filter")}
          </Button>
        </MenuFooter>
      </>
    );
  };

  return (
    <div ref={wrapperRef}>
      {isFiltered && (
        <Button
          btnStyle="warning"
          icon="times-circle"
          uppercase={false}
          onClick={clearFilter}
        >
          {__("Clear Filter")}
        </Button>
      )}
      <Button
        btnStyle="simple"
        uppercase={false}
        icon="bars"
        onClick={toggleMenu}
      >
        {showMenu ? __("Hide Filter") : __("Show Filter")}
      </Button>

      <CSSTransition
        in={showMenu}
        timeout={300}
        classNames="slide-in-right"
        unmountOnExit={true}
      >
        <RightMenuContainer>{renderTabContent()}</RightMenuContainer>
      </CSSTransition>
    </div>
  );
};

export default RightMenu;
