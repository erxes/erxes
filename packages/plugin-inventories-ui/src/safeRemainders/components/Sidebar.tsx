import React, { useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import dayjs from 'dayjs';
import Datetime from '@nateradebaugh/react-datetime';
// erxes
import { __, router } from '@erxes/ui/src/utils/core';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Box from '@erxes/ui/src/components/Box';
import Icon from '@erxes/ui/src/components/Icon';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
// local
import { SidebarContent } from '../../styles';

export default function Sidebar() {
  // Hooks
  const history = useHistory();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  // Methods
  const setFilter = (name: string, value: any) => {
    router.removeParams(history, 'page');
    router.setParams(history, { [name]: value });
  };

  const clearFilter = () => {
    router.removeParams(history, 'beginDate');
    router.removeParams(history, 'endDate');
    router.removeParams(history, 'branchId');
    router.removeParams(history, 'departmentId');
    router.removeParams(history, 'productId');
  };

  const isFiltered = (): boolean => {
    if (
      router.getParam(history, 'beginDate') ||
      router.getParam(history, 'endDate') ||
      router.getParam(history, 'branchId') ||
      router.getParam(history, 'departmentId') ||
      router.getParam(history, 'productId')
    )
      return true;

    return false;
  };

  const handleChangeDate = (label: string, date: any) => {
    const _date = dayjs(date).format('YYYY-MM-DD HH:mm');
    setFilter(label, _date);
  };

  const renderContent = () => (
    <FlexContent>
      <FlexItem>
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
            onChange={date => handleChangeDate('beginDate', date)}
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
            onChange={date => handleChangeDate('endDate', date)}
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
            onSelect={departmentId => setFilter('departmentId', departmentId)}
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
  );

  const renderExtraButtons = () => (
    <a href="#cancel" tabIndex={0} onClick={clearFilter}>
      <Icon icon="cancel-1" />
    </a>
  );

  return (
    <Wrapper.Sidebar>
      <Box
        title={'Filters'}
        isOpen={true}
        name="showFilters"
        extraButtons={isFiltered() && renderExtraButtons()}
      >
        <SidebarContent>
          <CommonForm renderContent={renderContent} />
        </SidebarContent>
      </Box>
    </Wrapper.Sidebar>
  );
}
