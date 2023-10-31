import { SidebarList as List } from '@erxes/ui/src/layout';
import { Wrapper } from '@erxes/ui/src/layout';
import { __, router } from '@erxes/ui/src/utils';
import React from 'react';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import { SidebarFilters } from '../../styles';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';

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
      'year',
      'filterStatus',
      'branchId',
      'departmentId',
      'productCategoryId',
      'productId'
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

    return (
      <Wrapper.Sidebar hasBorder>
        <Section.Title>
          {__('Filters')}
          <Section.QuickButtons>
            {(router.getParam(this.props.history, 'filterStatus') ||
              router.getParam(this.props.history, 'branchId') ||
              router.getParam(this.props.history, 'departmentId') ||
              router.getParam(this.props.history, 'productCategoryId') ||
              router.getParam(this.props.history, 'productId') ||
              router.getParam(this.props.history, 'year')) && (
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
              <ControlLabel required={true}>{__(`Year`)}</ControlLabel>
              <FormControl
                type="number"
                name="year"
                placeholder='all year is "0"'
                defaultValue={queryParams.year || new Date().getFullYear()}
                onChange={this.onInputChange}
              />
            </FormGroup>
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
              <ControlLabel>Status</ControlLabel>
              <FormControl
                name="filterStatus"
                componentClass="select"
                defaultValue={queryParams.filterStatus}
                required={false}
                onChange={e =>
                  this.setFilter(
                    'filterStatus',
                    (e.currentTarget as HTMLInputElement).value
                  )
                }
              >
                <option key={''} value={''}>
                  {' '}
                  {'All status'}{' '}
                </option>
                <option key={'active'} value={'active'}>
                  {' '}
                  {'active'}{' '}
                </option>
                <option key={'archived'} value={'archived'}>
                  {' '}
                  {'archived'}{' '}
                </option>
              </FormControl>
            </FormGroup>
          </List>
        </SidebarFilters>
      </Wrapper.Sidebar>
    );
  }
}

export default Sidebar;
