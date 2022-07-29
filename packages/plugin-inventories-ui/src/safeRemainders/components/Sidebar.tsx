import React from 'react';
import * as dayjs from 'dayjs';
import Datetime from '@nateradebaugh/react-datetime';
import {
  __,
  Wrapper,
  Box,
  ControlLabel,
  FormGroup,
  FormControl,
  Form as CommonForm,
  FlexContent
} from '@erxes/ui/src';
import { FlexItem } from '@erxes/ui-settings/src/styles';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import { router } from '@erxes/ui/src/utils/core';
import { SidebarContent } from '../../styles';

type Props = {
  queryParams: any;
  history: any;
};

const Sidebar = (props: Props) => {
  let timer: NodeJS.Timer;
  const { queryParams, history } = props;

  const setFilter = (name: string, value: any) => {
    router.removeParams(history, 'page');
    router.setParams(history, { [name]: value });
  };

  const onChangeDate = (lbl, date) => {
    const cDate = dayjs(date).format('YYYY-MM-DD HH:mm');
    setFilter(lbl, cDate);
  };

  const moveCursorAtTheEnd = (event: any) => {
    const tempValue = event.target.value;

    event.target.value = '';
    event.target.value = tempValue;
  };

  const search = (event: any) => {
    if (timer) {
      clearTimeout(timer);
    }

    const searchValue = event.target.value;

    timer = setTimeout(() => {
      setFilter('searchValue', searchValue);
    }, 500);
  };

  const renderContent = () => (
    <Box title={'Filters'} isOpen={true} name="showFilters">
      <SidebarContent>
        <FlexContent>
          <FlexItem>
            <FormGroup>
              <ControlLabel>{__('Search')}</ControlLabel>
              <FormControl
                type="text"
                placeholder={__('Type to search')}
                onChange={search}
                defaultValue={queryParams.searchValue}
                autoFocus={true}
                onFocus={moveCursorAtTheEnd}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Begin Date')}</ControlLabel>
              <Datetime
                inputProps={{ placeholder: 'Click to select a date' }}
                dateFormat="YYYY MM DD"
                timeFormat=""
                viewMode={'days'}
                closeOnSelect
                utc
                input
                value={queryParams.beginDate || null}
                onChange={date => onChangeDate('beginDate', date)}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('End Date')}</ControlLabel>
              <Datetime
                inputProps={{ placeholder: 'Click to select a date' }}
                dateFormat="YYYY MM DD"
                timeFormat=""
                viewMode={'days'}
                closeOnSelect
                utc
                input
                value={queryParams.endDate || null}
                onChange={date => onChangeDate('endDate', date)}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Branch')}</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="selectedBranchIds"
                initialValue={queryParams.branchId}
                onSelect={branchId => setFilter('branchId', branchId)}
                multi={false}
                customOption={{ value: '', label: 'All branches' }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Department')}</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="selectedDepartmentIds"
                initialValue={queryParams.departmentId}
                onSelect={departmentId =>
                  setFilter('departmentId', departmentId)
                }
                multi={false}
                customOption={{ value: '', label: 'All departments' }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Product')}</ControlLabel>
              <SelectProducts
                label="Choose product"
                name="selectedProductId"
                initialValue={queryParams.productId}
                onSelect={productId => setFilter('productId', productId)}
                multi={false}
                customOption={{ value: '', label: 'All products' }}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>
      </SidebarContent>
    </Box>
  );

  return (
    <Wrapper.Sidebar>
      <CommonForm renderContent={renderContent} />
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
