import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import Tip from '@erxes/ui/src/components/Tip';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __, router } from '@erxes/ui/src/utils/core';
import { SidebarFilters } from '../../styles';
import { SidebarList as List } from '@erxes/ui/src/layout';
import { useHistory } from 'react-router-dom';

const { Section } = Wrapper.Sidebar;

export default function Sidebar() {
  const history = useHistory();

  const categoryId = router.getParam(history, 'categoryId');
  const branchId = router.getParam(history, 'branchId');
  const departmentId = router.getParam(history, 'departmentId');

  const clearFilter = () => {
    router.setParams(history, {
      categoryId: null,
      branchId: null,
      departmentId: null,
      beginDate: null,
      endDate: null,
      productIds: null
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
          {(branchId || departmentId || categoryId) && (
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
        </List>
      </SidebarFilters>
    </Wrapper.Sidebar>
  );
}
