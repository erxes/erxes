import * as path from 'path';

import {
  Button,
  ControlLabel,
  FormControl,
  Icon,
  SelectTeamMembers
} from '@erxes/ui/src';
import {
  CustomRangeContainer,
  FilterBox,
  FilterButton,
  MenuFooter,
  RightMenuContainer,
  TabContent
} from '../../styles';

import Datetime from '@nateradebaugh/react-datetime';
import { IQueryParams } from '@erxes/ui/src/types';
import RTG from 'react-transition-group';
import React from 'react';
import { __ } from 'coreui/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import dayjs from 'dayjs';
import { isEnabled } from '@erxes/ui/src/utils/core';

const SelectCustomers = asyncComponent(
  () =>
    isEnabled('contacts') &&
    import(
      /* webpackChunkName: "SelectCustomers" */ '@erxes/ui-contacts/src/customers/containers/SelectCustomers'
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

type StringState = {
  currentTab: string;
};

type State = {
  showMenu: boolean;
  filterParams: IQueryParams;
} & StringState;

export default class RightMenu extends React.Component<Props, State> {
  private wrapperRef;

  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'Filter',
      showMenu: false,

      filterParams: this.props.queryParams
    };

    this.setWrapperRef = this.setWrapperRef.bind(this);
  }

  setFilter = () => {
    const { filterParams } = this.state;
    this.props.onFilter(filterParams);
  };

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

  onSelect = (values: string[] | string, key: string) => {
    const { filterParams } = this.state;
    this.setState({ filterParams: { ...filterParams, [key]: String(values) } });
  };

  onChangeInput = e => {
    const target = e.target;
    const name = target.name;
    const value = target.value;

    const { filterParams } = this.state;
    this.setState({ filterParams: { ...filterParams, [name]: value } });
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

  onChangeRangeFilter = (kind, date) => {
    const { filterParams } = this.state;
    const cDate = dayjs(date).format('YYYY-MM-DD HH:mm');
    this.setState({ filterParams: { ...filterParams, [kind]: cDate } });
  };

  renderSpecials() {
    return (
      <>
        {this.renderLink('Only Today', 'paidDate', 'today')}
        {this.renderLink('Only Me', 'userId', 'me')}
        {this.renderLink('No Pos', 'userId', 'nothing')}
      </>
    );
  }

  renderRange(dateType: string) {
    const { filterParams } = this.state;

    const lblStart = `${dateType}StartDate`;
    const lblEnd = `${dateType}EndDate`;

    return (
      <>
        <ControlLabel>{`${dateType} Date range:`}</ControlLabel>

        <CustomRangeContainer>
          <div className="input-container">
            <Datetime
              inputProps={{ placeholder: __('Click to select a date') }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              value={filterParams[lblStart] || null}
              closeOnSelect={true}
              utc={true}
              input={true}
              onChange={this.onChangeRangeFilter.bind(this, lblStart)}
              viewMode={'days'}
              className={'filterDate'}
            />
          </div>

          <div className="input-container">
            <Datetime
              inputProps={{ placeholder: __('Click to select a date') }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              value={filterParams[lblEnd]}
              closeOnSelect={true}
              utc={true}
              input={true}
              onChange={this.onChangeRangeFilter.bind(this, lblEnd)}
              viewMode={'days'}
              className={'filterDate'}
            />
          </div>
        </CustomRangeContainer>
      </>
    );
  }

  renderFilter() {
    const { filterParams } = this.state;

    return (
      <FilterBox>
        <FormControl
          name={'search'}
          defaultValue={filterParams.search}
          placeholder={__('Number ...')}
          onKeyPress={this.onSearch}
          autoFocus={true}
          onChange={this.onChangeInput}
        />

        {isEnabled('contacts') && (
          <SelectCustomers
            label="Filter by customer"
            name="customerId"
            initialValue={filterParams.customerId}
            onSelect={this.onSelect}
            customOption={{ value: '', label: '...Clear customer filter' }}
            multi={false}
          />
        )}

        <SelectTeamMembers
          label="Choose users"
          name="userId"
          initialValue={filterParams.userId}
          onSelect={this.onSelect}
          customOption={{ value: '', label: '...Clear user filter' }}
          multi={false}
        />

        {this.renderRange('created')}
        {this.renderRange('paid')}

        {this.renderSpecials()}
      </FilterBox>
    );
  }

  renderTabContent() {
    return (
      <>
        <TabContent>{this.renderFilter()}</TabContent>
        <MenuFooter>
          <Button
            block={true}
            btnStyle="success"
            uppercase={false}
            onClick={this.setFilter}
            icon="filter"
          >
            {__('Filter')}
          </Button>
        </MenuFooter>
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
          {showMenu ? __('Hide Filter') : __('Show Filter')}
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
