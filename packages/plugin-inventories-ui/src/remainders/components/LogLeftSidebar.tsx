import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { SidebarList as List } from '@erxes/ui/src/layout';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { router, __ } from '@erxes/ui/src/utils/core';
import Datetime from '@nateradebaugh/react-datetime';
import moment from 'moment';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { SidebarFilters } from '../../styles';

const { Section } = Wrapper.Sidebar;

type Props = {
  handlePrint: () => void;
};

const LogLeftSidebar = (props: Props) => {
  const { handlePrint } = props;
  const history = useHistory();
  const [filterParams, setFilterParams] = useState<any>({
    categoryId: router.getParam(history, 'categoryId'),
    productIds: router.getParam(history, 'productIds'),
    branchId: router.getParam(history, 'branchId'),
    departmentId: router.getParam(history, 'departmentId'),
    beginDate: router.getParam(history, 'beginDate'),
    endDate: router.getParam(history, 'endDate'),
    isDetailed: router.getParam(history, 'isDetailed')
  });

  const categoryId = (filterParams || {}).categoryId;
  const productIds = (filterParams || {}).productIds;
  const branchId = (filterParams || {}).branchId;
  const departmentId = (filterParams || {}).departmentId;
  const beginDate = (filterParams || {}).beginDate;
  const endDate = (filterParams || {}).endDate;
  const isDetailed = (filterParams || {}).isDetailed;

  const clearFilter = () => {
    router.setParams(history, {
      categoryId: null,
      branchId: null,
      departmentId: null,
      productIds: null,
      endDate: null,
      beginDate: null
    });
  };

  const setFilter = (key, value) => {
    setFilterParams({ ...filterParams, [key]: value });
  };

  const runFilter = () => {
    router.setParams(history, {
      ...filterParams,
      isDetailed: filterParams.isDetailed ? true : undefined
    });
  };

  return (
    <Wrapper.Sidebar>
      <Section.Title>
        {__('Filters')}
        <Section.QuickButtons>
          {(branchId ||
            departmentId ||
            categoryId ||
            (productIds || []).length ||
            endDate ||
            beginDate) && (
            <a href="#cancel" tabIndex={0} onClick={clearFilter}>
              <Tip text={__('Clear filter')} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </Section.QuickButtons>
      </Section.Title>
      <SidebarFilters>
        <List id="SettingsSidebar">
          <FormGroup>
            <ControlLabel>{__('Begin Date')}</ControlLabel>
            <Datetime
              inputProps={{ placeholder: 'Click to select a date' }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              viewMode={'days'}
              utc={true}
              value={beginDate || null}
              onChange={date =>
                setFilter('beginDate', moment(date).format('YYYY/MM/DD HH:mm'))
              }
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('End Date')}</ControlLabel>
            <Datetime
              inputProps={{ placeholder: 'Click to select a date' }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              viewMode={'days'}
              utc={true}
              value={endDate || null}
              onChange={date =>
                setFilter('endDate', moment(date).format('YYYY/MM/DD HH:mm'))
              }
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Branch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="branchId"
              initialValue={branchId || ''}
              customOption={{
                value: '',
                label: '...Clear branch filter'
              }}
              onSelect={branchId => setFilter('branchId', branchId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Department</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="departmentId"
              initialValue={departmentId || ''}
              customOption={{
                value: '',
                label: '...Clear department filter'
              }}
              onSelect={departmentId => setFilter('departmentId', departmentId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Product Category</ControlLabel>
            <SelectProductCategory
              label="Choose product category"
              name="categoryId"
              initialValue={categoryId || ''}
              customOption={{
                value: '',
                label: '...Clear product category filter'
              }}
              onSelect={categoryId => setFilter('categoryId', categoryId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Products</ControlLabel>
            <SelectProducts
              label="Choose product"
              name="productIds"
              initialValue={productIds}
              customOption={{
                value: '',
                label: '...Clear product filter'
              }}
              onSelect={productIds => setFilter('productIds', productIds)}
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Is Detailed</ControlLabel>
            <FormControl
              defaultChecked={isDetailed}
              name="isDetailed"
              componentClass="checkbox"
              onChange={e => setFilter('isDetailed', (e.target as any).checked)}
            />
          </FormGroup>
        </List>
        <Button btnStyle="success" onClick={runFilter} block>
          {__('Filter')}
        </Button>
        <br />
        <Button btnStyle="primary" onClick={handlePrint} block>
          {__('Print')}
        </Button>
      </SidebarFilters>
    </Wrapper.Sidebar>
  );
};

export default LogLeftSidebar;
