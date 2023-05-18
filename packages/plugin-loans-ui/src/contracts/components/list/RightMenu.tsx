import { Button, ControlLabel, FormControl, Icon } from '@erxes/ui/src';
import {
  CustomRangeContainer,
  FilterBox,
  FilterButton,
  MenuFooter,
  RightMenuContainer,
  TabContent
} from '../../../styles';

import RTG from 'react-transition-group';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';
import SelectContractType from '../../../contractTypes/containers/SelectContractType';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';

const SelectCompanies = asyncComponent(
  () =>
    isEnabled('contacts') &&
    import(
      /* webpackChunkName: "SelectCompanies" */ '@erxes/ui-contacts/src/companies/containers/SelectCompanies'
    )
);

const SelectCustomers = asyncComponent(
  () =>
    isEnabled('contacts') &&
    import(
      /* webpackChunkName: "SelectCustomers" */ '@erxes/ui-contacts/src/customers/containers/SelectCustomers'
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

type State = {
  showMenu: boolean;
} & StringState;

export default class RightMenu extends React.Component<Props, State> {
  private wrapperRef;

  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'Filter',
      showMenu: false
    };

    this.setWrapperRef = this.setWrapperRef.bind(this);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  toggleMenu = () => {
    this.setState({ showMenu: !this.state.showMenu });
  };

  onSearch = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget as HTMLInputElement;
      this.props.onSearch(target.value || '');
    }
  };

  onChange = (name: string, value: string) => {
    this.setState({ [name]: value } as Pick<StringState, keyof StringState>);
  };

  renderLink(label: string, key: string, value: string) {
    const { onSelect, queryParams } = this.props;

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
  }

  onChangeRangeFilter = (kind, e) => {
    this.props.onSelect(e.currentTarget.value, kind);
  };

  renderDates() {
    return (
      <>
        {this.renderLink('Today repayment', 'repaymentDate', 'today')}
        {this.renderLink('Expired repayment', 'isExpired', 'true')}
        {this.renderLink('Close contract today', 'closeDateType', 'today')}
        {this.renderLink(
          'Close contract this week',
          'closeDateType',
          'thisWeek'
        )}
        {this.renderLink(
          'Close contract this month',
          'closeDateType',
          'thisMonth'
        )}
      </>
    );
  }

  renderFilter() {
    const { queryParams, onSelect } = this.props;

    return (
      <FilterBox>
        <FormControl
          defaultValue={queryParams.search}
          placeholder={__('Number ...')}
          onKeyPress={this.onSearch}
          autoFocus={true}
        />

        <SelectCustomers
          label="Filter by customer"
          name="customerId"
          queryParams={queryParams}
          onSelect={onSelect}
          multi={false}
        />

        <SelectBranches
          label="Filter by branch"
          name="branchId"
          queryParams={queryParams}
          onSelect={onSelect}
          multi={false}
        />

        <SelectCompanies
          label="Filter by company"
          name="companyId"
          queryParams={queryParams}
          onSelect={onSelect}
          multi={false}
        />

        <SelectContractType
          label="Filter by contract type"
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
          placeholder={'Lease Amount'}
          onChange={this.onChangeRangeFilter.bind(this, 'leaseAmount')}
        />
        <FormControl
          defaultValue={queryParams.interestRate}
          type="number"
          required={false}
          name="interestRate"
          placeholder={'Interest Rate'}
          onChange={this.onChangeRangeFilter.bind(this, 'interestRate')}
        />
        <FormControl
          defaultValue={queryParams.tenor}
          type="number"
          required={false}
          name="tenor"
          placeholder={'Tenor'}
          onChange={this.onChangeRangeFilter.bind(this, 'tenor')}
        />
        <FormControl
          defaultValue={queryParams.repayment}
          type="select"
          componentClass="select"
          required={false}
          name="repayment"
          options={[
            { value: 'fixed', label: 'fixed' },
            { value: 'equal', label: 'equal' }
          ]}
          placeholder={'repayment'}
          onChange={this.onChangeRangeFilter.bind(this, 'repayment')}
        />
        <ControlLabel>Start Date range:</ControlLabel>

        <CustomRangeContainer>
          <div className="input-container">
            <FormControl
              defaultValue={queryParams.startDate}
              type="date"
              required={false}
              name="startStartDate"
              onChange={this.onChangeRangeFilter.bind(this, 'startStartDate')}
              placeholder={'Start date'}
            />
          </div>

          <div className="input-container">
            <FormControl
              defaultValue={queryParams.endDate}
              type="date"
              required={false}
              name="endStartDate"
              placeholder={'End date'}
              onChange={this.onChangeRangeFilter.bind(this, 'endStartDate')}
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
              onChange={this.onChangeRangeFilter.bind(this, 'startCloseDate')}
              placeholder={'Start date'}
            />
          </div>

          <div className="input-container">
            <FormControl
              defaultValue={queryParams.endDate}
              type="date"
              required={false}
              name="endCloseDate"
              placeholder={'End date'}
              onChange={this.onChangeRangeFilter.bind(this, 'endCloseDate')}
            />
          </div>
        </CustomRangeContainer>

        {this.renderDates()}
      </FilterBox>
    );
  }

  renderTabContent() {
    const { isFiltered, clearFilter } = this.props;

    return (
      <>
        <TabContent>{this.renderFilter()}</TabContent>
        {isFiltered && (
          <MenuFooter>
            <Button
              block={true}
              btnStyle="warning"
              uppercase={false}
              onClick={clearFilter}
              icon="times-circle"
            >
              {__('Clear Filter')}
            </Button>
          </MenuFooter>
        )}
      </>
    );
  }

  render() {
    const { showMenu } = this.state;
    const { isFiltered } = this.props;

    return (
      <div ref={this.setWrapperRef}>
        {isFiltered && (
          <Button
            btnStyle="warning"
            icon="times-circle"
            uppercase={false}
            onClick={this.props.clearFilter}
          >
            {__('Clear Filter')}
          </Button>
        )}
        <Button
          btnStyle="simple"
          uppercase={false}
          icon="bars"
          onClick={this.toggleMenu}
        >
          {showMenu ? __('Hide Menu') : __('Show Menu')}
        </Button>

        <RTG.CSSTransition
          in={this.state.showMenu}
          timeout={300}
          classNames="slide-in-right"
          unmountOnExit={true}
        >
          <RightMenuContainer>{this.renderTabContent()}</RightMenuContainer>
        </RTG.CSSTransition>
      </div>
    );
  }
}
