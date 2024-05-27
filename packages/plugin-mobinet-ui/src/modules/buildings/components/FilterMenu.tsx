import * as path from 'path';

import {
  Button,
  ControlLabel,
  FormControl,
  Icon,
  SelectTeamMembers,
} from '@erxes/ui/src';
import FormGroup from '@erxes/ui/src/components/form/Group';
import {
  CustomRangeContainer,
  FilterBox,
  FilterButton,
  MenuFooter,
  RightMenuContainer,
  TabContent,
} from '../../../common/styles';

import Datetime from '@nateradebaugh/react-datetime';
import { IQueryParams } from '@erxes/ui/src/types';
import { CSSTransition } from 'react-transition-group';
import React, { useState } from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import dayjs from 'dayjs';
import { isEnabled, __ } from '@erxes/ui/src/utils/core';
import SelectCity from '../../cities/containers/SelectCity';
import SelectDistrict from '../../districts/containers/SelectDistrict';
import SelectQuarter from '../../quarters/containers/SelectQuarter';
import { ICoordinates } from '../../../types';
import { setParams } from '@erxes/ui/src/utils/router';

const SelectCustomers = asyncComponent(
  () =>
    isEnabled('contacts') &&
    import(
      /* webpackChunkName: "SelectCustomers" */ '@erxes/ui-contacts/src/customers/containers/SelectCustomers'
    )
);

type Props = {
  onSearch?: (search: string) => void;
  onFilter?: (filterParams: IQueryParams) => void;
  queryParams?: any;
  isFiltered?: boolean;
  clearFilter?: () => void;
  changeMapCenter: (param: any) => void;
};

type StringState = {
  currentTab: string;
};

type State = {
  showMenu: boolean;
  filterParams: IQueryParams;
} & StringState;

type FilterType = {
  searchValue?: string;
  cityId?: string;
  districtId?: string;
  quarterId?: string;
  serviceStatus?: string;
  networkType?: string;
};
const FilterMenu = (props: Props) => {
  const [currentTab, setCurrentTab] = useState('Filter');
  const [showMenu, setShowMenu] = useState(false);
  const [filterParams, setFilterParams] = useState<FilterType>(
    props.queryParams || {
      cityId: '',
      districtId: '',
      quarterId: '',
      serviceStatus: '',
      networkType: '',
    }
  );

  const setFilter = () => {
    props.onFilter && props.onFilter(filterParams);
  };

  const toggleMenu = () => {
    setShowMenu(prev => !prev);
  };

  const onSearch = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget as HTMLInputElement;
      props.onSearch && props.onSearch(target.value || '');
    }
  };

  const onChangeInput = e => {
    const target = e.target;
    const name = target.name;
    const value = target.value;

    setFilterParams(prev => ({ ...prev, [name]: value }));
  };
  const onChangeQuarter = (quarterId, center?: ICoordinates) => {
    setFilterParams(prev => ({
      ...prev,
      quarterId: String(quarterId),
    }));
    if (center) {
      props.changeMapCenter(center);
    }
  };
  const onChangeDistrict = (districtId, center?: ICoordinates) => {
    setFilterParams(prev => ({
      ...prev,
      districtId: String(districtId),
      quarterId: '',
    }));
    if (center) {
      props.changeMapCenter(center);
    }
  };

  const onChangeCity = (cityId, center?: ICoordinates) => {
    setFilterParams(prev => ({
      ...prev,
      cityId,
      districtId: '',
      quarterId: '',
    }));
    if (center) {
      props.changeMapCenter(center);
    }
  };

  const renderFilter = () => {
    return (
      <FilterBox>
        <FormControl
          name={'searchValue'}
          defaultValue={filterParams.searchValue || ''}
          placeholder={__('search')}
          onKeyPress={onSearch}
          autoFocus={true}
          onChange={onChangeInput}
        />

        <SelectCity
          defaultValue={filterParams.cityId}
          onChange={onChangeCity}
        />

        {filterParams.cityId && (
          <SelectDistrict
            cityId={filterParams.cityId}
            defaultValue={filterParams.districtId || ''}
            onChange={onChangeDistrict}
          />
        )}

        {filterParams.districtId && (
          <SelectQuarter
            districtId={filterParams.districtId}
            defaultValue={filterParams.quarterId || ''}
            onChange={onChangeQuarter}
          />
        )}

        <FormGroup>
          <ControlLabel>Service status</ControlLabel>
          <FormControl
            id={'serviceStatus'}
            // componentClass='select'
            defaultValue={filterParams.serviceStatus}
            name='serviceStatus'
            onChange={onChangeInput}
          >
            {['', 'inactive', 'active', 'inprogress'].map((p, index) => (
              <option key={index} value={p}>
                {p}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Network type</ControlLabel>
          <FormControl
            id={'networkType'}
            // componentClass='select'
            defaultValue={filterParams.networkType}
            name='networkType'
            onChange={onChangeInput}
          >
            {['', 'ftth', 'fttb'].map((p, index) => (
              <option key={index} value={p}>
                {p}
              </option>
            ))}
          </FormControl>
        </FormGroup>
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
            btnStyle='success'
            uppercase={false}
            onClick={setFilter}
            icon='filter'
          >
            {__('Filter')}
          </Button>
        </MenuFooter>
      </>
    );
  };

  const { isFiltered } = props;

  return (
    <div>
      {isFiltered && (
        <Button
          btnStyle='warning'
          icon='times-circle'
          uppercase={false}
          onClick={props.clearFilter}
        >
          {__('Clear Filter')}
        </Button>
      )}
      <Button
        btnStyle='simple'
        uppercase={false}
        icon='bars'
        onClick={toggleMenu}
      >
        {showMenu ? __('Hide Filter') : __('Show Filter')}
      </Button>

      <CSSTransition
        in={showMenu}
        timeout={300}
        className='slide-in-right'
        appear={true}
        unmountOnExit={true}
      >
        <RightMenuContainer>{renderTabContent()}</RightMenuContainer>
      </CSSTransition>
    </div>
  );
};

export default FilterMenu;
