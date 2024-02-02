import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import React, { useRef } from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __, router } from '@erxes/ui/src/utils';
import { Link } from 'react-router-dom';
import { SidebarFilters } from '../../../styles';
import { SidebarList as List } from '@erxes/ui/src/layout';
import { Wrapper } from '@erxes/ui/src/layout';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';

type Props = {
  history: any;
  queryParams: any;
};

const { Section } = Wrapper.Sidebar;

const Sidebar = (props: Props) => {
  const { history, queryParams } = props;

  const timerRef = useRef<number | null>(null);

  const clearCategoryFilter = () => {
    router.removeParams(
      history,
      'departmentId',
      'branchId',
      'productCategoryId',
    );
  };

  const setFilter = (name, value) => {
    router.removeParams(history, 'page');
    router.setParams(history, { [name]: value });
  };

  const renderListItem = (url: string, text: string) => {
    return (
      <li>
        <Link
          to={url}
          className={window.location.href.includes(url) ? 'active' : ''}
        >
          {__(text)}
        </Link>
      </li>
    );
  };

  return (
    <>
      <Section.Title>
        {__('Filters')}
        <Section.QuickButtons>
          {(router.getParam(history, 'departmentId') ||
            router.getParam(history, 'branchId') ||
            router.getParam(history, 'productCategoryId')) && (
            <a href="#cancel" tabIndex={0} onClick={clearCategoryFilter}>
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
              initialValue={queryParams.branchId || ''}
              customOption={{
                value: '',
                label: '...Clear branch filter',
              }}
              onSelect={(branchId) => setFilter('branchId', branchId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Department</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="departmentId"
              initialValue={queryParams.departmentId || ''}
              customOption={{
                value: '',
                label: '...Clear department filter',
              }}
              onSelect={(departmentId) =>
                setFilter('departmentId', departmentId)
              }
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Product Category</ControlLabel>
            <SelectProductCategory
              label="Choose product category"
              name="productCategoryId"
              initialValue={queryParams.productCategoryId || ''}
              customOption={{
                value: '',
                label: '...Clear product category filter',
              }}
              onSelect={(categoryId) =>
                setFilter('productCategoryId', categoryId)
              }
              multi={false}
            />
          </FormGroup>
        </List>
      </SidebarFilters>
    </>
  );
};

export default Sidebar;
