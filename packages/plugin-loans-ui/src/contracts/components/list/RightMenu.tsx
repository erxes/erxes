import {
  CustomRangeContainer,
  FilterBox,
  FilterButton,
  MenuFooter,
  RightMenuContainer,
  TabContent
} from "../../../styles";
import React, { useRef, useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import { CSSTransition } from "react-transition-group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import Icon from "@erxes/ui/src/components/Icon";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectContractType from "../../../contractTypes/containers/SelectContractType";
import { __ } from "coreui/utils";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { isEnabled } from "@erxes/ui/src/utils/core";

const SelectCompanies = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SelectCompanies" */ "@erxes/ui-contacts/src/companies/containers/SelectCompanies"
    )
);

const SelectCustomers = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SelectCustomers" */ "@erxes/ui-contacts/src/customers/containers/SelectCustomers"
    )
);

type Props = {
  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, key: string) => void;
  queryParams: any;
  isFiltered: boolean;
  clearFilter: () => void;
};

type StringState = {
  currentTab: string;
};

export default function RightMenu(props: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const wrapperRef = useRef(null);

  const setWrapperRef = node => {
    wrapperRef.current = node;
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const onSearch = e => {
    if (e.key === "Enter") {
      const target = e.currentTarget;
      props.onSearch(target.value || "");
    }
  };

  const renderLink = (label: string, key: string, value: string) => {
    const { onSelect, queryParams } = props;

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

  const onChangeRangeFilter = (kind, e) => {
    props.onSelect(e.currentTarget.value, kind);
  };

  const renderDates = () => {
    return (
      <>
        {renderLink("Today repayment", "repaymentDate", "today")}
        {renderLink("Expired repayment", "isExpired", "true")}
        {renderLink("Close contract today", "closeDateType", "today")}
        {renderLink("Close contract this week", "closeDateType", "thisWeek")}
        {renderLink("Close contract this month", "closeDateType", "thisMonth")}
      </>
    );
  };

  const renderFilter = () => {
    const { queryParams, onSelect } = props;

    return (
      <FilterBox>
        <FormControl
          defaultValue={queryParams.search}
          placeholder={__("Contract Number") + " ..."}
          onKeyPress={onSearch}
          autoFocus={true}
        />

        <SelectCustomers
          label={__("Filter by customers")}
          name="customerId"
          queryParams={queryParams}
          onSelect={onSelect}
          multi={false}
        />

        <SelectBranches
          label={__("Filter by branch")}
          name="branchId"
          queryParams={queryParams}
          onSelect={onSelect}
          multi={false}
        />

        <SelectCompanies
          label={__("Filter by companies")}
          name="companyId"
          queryParams={queryParams}
          onSelect={onSelect}
          multi={false}
        />

        <SelectContractType
          label={__("Filter by contract type")}
          name="contractTypeId"
          queryParams={queryParams}
          onSelect={onSelect}
          multi={false}
        />
        <FormControl
          defaultValue={queryParams.leaseAmount}
          type="number"
          required={false}
          name="leaseAmount"
          placeholder={__("Lease Amount")}
          onChange={onChangeRangeFilter.bind(this, "leaseAmount")}
        />
        <FormControl
          defaultValue={queryParams.interestRate}
          type="number"
          required={false}
          name="interestRate"
          placeholder={__("Interest Rate")}
          onChange={onChangeRangeFilter.bind(this, "interestRate")}
        />
        <FormControl
          defaultValue={queryParams.tenor}
          type="number"
          required={false}
          name="tenor"
          placeholder={__("Tenor")}
          onChange={onChangeRangeFilter.bind(this, "tenor")}
        />
        <FormControl
          defaultValue={queryParams.repayment}
          type="select"
          componentclass="select"
          required={false}
          name="repayment"
          options={[
            { value: "fixed", label: "fixed" },
            { value: "equal", label: "equal" }
          ]}
          placeholder={"repayment"}
          onChange={onChangeRangeFilter.bind(this, "repayment")}
        />
        <ControlLabel>Start Date range:</ControlLabel>

        <CustomRangeContainer>
          <div className="input-container">
            <FormControl
              defaultValue={queryParams.startDate}
              type="date"
              required={false}
              name="startStartDate"
              onChange={onChangeRangeFilter.bind(this, "startStartDate")}
              placeholder={__("Start date")}
            />
          </div>

          <div className="input-container">
            <FormControl
              defaultValue={queryParams.endDate}
              type="date"
              required={false}
              name="endStartDate"
              placeholder={__("End date")}
              onChange={onChangeRangeFilter.bind(this, "endStartDate")}
            />
          </div>
        </CustomRangeContainer>
        <ControlLabel>Close Date range:</ControlLabel>

        <CustomRangeContainer>
          <div className="input-container">
            <FormControl
              defaultValue={queryParams.startDate}
              type="date"
              required={false}
              name="startCloseDate"
              onChange={onChangeRangeFilter.bind(this, "startCloseDate")}
              placeholder={__("Start date")}
            />
          </div>

          <div className="input-container">
            <FormControl
              defaultValue={queryParams.endDate}
              type="date"
              required={false}
              name="endCloseDate"
              placeholder={__("End date")}
              onChange={onChangeRangeFilter.bind(this, "endCloseDate")}
            />
          </div>
        </CustomRangeContainer>

        {renderDates()}
      </FilterBox>
    );
  };

  const renderTabContent = () => {
    const { isFiltered, clearFilter } = props;

    return (
      <>
        <TabContent>{renderFilter()}</TabContent>
        {isFiltered && (
          <MenuFooter>
            <Button
              block={true}
              btnStyle="warning"
              uppercase={false}
              onClick={clearFilter}
              icon="times-circle"
            >
              {__("Clear Filter")}
            </Button>
          </MenuFooter>
        )}
      </>
    );
  };

  const { isFiltered } = props;

  return (
    <div ref={setWrapperRef}>
      {isFiltered && (
        <Button
          btnStyle="warning"
          icon="times-circle"
          uppercase={false}
          onClick={props.clearFilter}
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
        {showMenu ? __("Hide Menu") : __("Show Menu")}
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
}
