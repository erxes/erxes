import moment from 'moment';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { SidebarList as List } from '@erxes/ui/src/layout';
import React from 'react';
import Datetime from '@nateradebaugh/react-datetime';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';

//erxes
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Button from '@erxes/ui/src/components/Button';
import { __, router } from '@erxes/ui/src/utils/core';
import { useHistory } from 'react-router-dom';
//local
import { SidebarFilters } from '../../styles';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';

const { Section } = Wrapper.Sidebar;

type Props = {
  handlePrint: () => void;
};

const LogLeftSidebar = (props: Props) => {
  const { handlePrint } = props;
  const history = useHistory();

  const categoryId = router.getParam(history, 'categoryId');
  const productIds = router.getParam(history, 'productIds');
  const branchId = router.getParam(history, 'branchId');
  const departmentId = router.getParam(history, 'departmentId');
  const beginDate = router.getParam(history, 'beginDate');
  const endDate = router.getParam(history, 'endDate');

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
    router.setParams(history, { [key]: value, page: 1 });
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
              dateFormat="YYYY MM DD"
              timeFormat=""
              viewMode={'days'}
              closeOnSelect
              utc
              input
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
              dateFormat="YYYY MM DD"
              timeFormat=""
              viewMode={'days'}
              closeOnSelect
              utc
              input
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
        </List>
      </SidebarFilters>
      <Button btnStyle="primary" onClick={handlePrint} block>
        {__('Print')}
      </Button>
    </Wrapper.Sidebar>
  );
};

export default LogLeftSidebar;
