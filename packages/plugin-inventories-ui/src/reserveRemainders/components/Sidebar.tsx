import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import Tip from '@erxes/ui/src/components/Tip';
import { __, router } from '@erxes/ui/src/utils';
import { SidebarFilters } from '../../styles';
import { SidebarList as List } from '@erxes/ui/src/layout';
import { Wrapper } from '@erxes/ui/src/layout';

interface Props {
  history: any;
  queryParams: any;
}

const { Section } = Wrapper.Sidebar;

class Sidebar extends React.Component<Props> {
  private timer?: NodeJS.Timer;

  clearFilter = () => {
    router.removeParams(
      this.props.history,
      'date',
      'filterStatus',
      'branchId',
      'departmentId',
      'productCategoryId',
      'productId',
      'remainder'
    );
  };

  setFilter = (name, value) => {
    router.removeParams(this.props.history, 'page');
    router.setParams(this.props.history, { [name]: value });
  };

  onInputChange = e => {
    e.preventDefault();

    if (this.timer) {
      clearTimeout(this.timer);
    }

    const value = e.target.value;
    const name = e.target.name;
    this.timer = setTimeout(() => {
      this.setFilter(name, value);
    }, 500);
  };

  render() {
    const { queryParams } = this.props;
    const onChange = e => {
      const value = e.target.value;
      this.setFilter('remainder', value);
    };

    return (
      <Wrapper.Sidebar hasBorder>
        <Section.Title>
          {__('Filters')}
          <Section.QuickButtons>
            {(router.getParam(this.props.history, 'branchId') ||
              router.getParam(this.props.history, 'departmentId') ||
              router.getParam(this.props.history, 'productCategoryId') ||
              router.getParam(this.props.history, 'productId') ||
              router.getParam(this.props.history, 'remainder')) && (
              <a href="#cancel" tabIndex={0} onClick={this.clearFilter}>
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
                  label: '...Clear branch filter'
                }}
                onSelect={branchId => this.setFilter('branchId', branchId)}
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
                  label: '...Clear department filter'
                }}
                onSelect={departmentId =>
                  this.setFilter('departmentId', departmentId)
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
                  label: '...Clear product category filter'
                }}
                onSelect={categoryId =>
                  this.setFilter('productCategoryId', categoryId)
                }
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Product</ControlLabel>
              <SelectProducts
                label="Choose product"
                name="productId"
                initialValue={queryParams.productId || ''}
                customOption={{
                  value: '',
                  label: '...Clear product filter'
                }}
                onSelect={productId => this.setFilter('productId', productId)}
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Remainder</ControlLabel>
              <FormControl
                type="number"
                name={'remainder'}
                defaultValue={queryParams.remainder || 0}
                onChange={onChange}
              />
            </FormGroup>
          </List>
        </SidebarFilters>
      </Wrapper.Sidebar>
    );
  }
}

export default Sidebar;
