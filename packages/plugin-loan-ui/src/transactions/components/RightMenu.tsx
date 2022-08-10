import * as path from 'path';

import { Button, ControlLabel, FormControl, Icon } from '@erxes/ui/src';
import {
  CustomRangeContainer,
  FilterBox,
  FilterButton,
  MenuFooter,
  RightMenuContainer,
  TabContent
} from '../../styles';

import RTG from 'react-transition-group';
import React from 'react';
import { __ } from 'coreui/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';

const SelectCompanies = asyncComponent(
  () =>
    isEnabled('contacts') &&
    path.resolve(
      /* webpackChunkName: "SelectCompanies" */ '@erxes/ui-contacts/src/companies/containers/SelectCompanies'
    )
);

const SelectCustomers = asyncComponent(
  () =>
    isEnabled('contacts') &&
    path.resolve(
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
        {this.renderLink('Only Today', 'payDate', 'today')}
        {this.renderLink('Has no contract', 'contractHasnt', 'true')}
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

        {isEnabled('contacts') && (
          <>
            <SelectCustomers
              label="Filter by customer"
              name="customerId"
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
          </>
        )}

        <ControlLabel>Date range:</ControlLabel>

        <CustomRangeContainer>
          <div className="input-container">
            <FormControl
              defaultValue={queryParams.startDate}
              type="date"
              required={false}
              name="startDate"
              onChange={this.onChangeRangeFilter.bind(this, 'startDate')}
              placeholder={'Start date'}
            />
          </div>

          <div className="input-container">
            <FormControl
              defaultValue={queryParams.endDate}
              type="date"
              required={false}
              name="endDate"
              placeholder={'End date'}
              onChange={this.onChangeRangeFilter.bind(this, 'endDate')}
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
