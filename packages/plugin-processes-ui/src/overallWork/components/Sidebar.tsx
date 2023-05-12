import ControlLabel from '@erxes/ui/src/components/form/Label';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import moment from 'moment';
import queryString from 'query-string';
import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import Tip from '@erxes/ui/src/components/Tip';
import { router } from '@erxes/ui/src/utils';
import { __ } from 'coreui/utils';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { MenuFooter, SidebarFilters } from '../../styles';
import { SidebarList as List } from '@erxes/ui/src/layout';
import { Wrapper } from '@erxes/ui/src/layout';
import { IQueryParams } from '@erxes/ui/src/types';
import SelectJobCategory from '../../job/containers/category/SelectJobCategory';
import SelectJobRefer from '../../job/containers/refer/SelectJobRefer';
import { JOB_TYPE_CHOISES } from '../../constants';
import Button from '@erxes/ui/src/components/Button';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';

interface Props {
  history: any;
  queryParams: any;
}

type State = {
  filterParams: IQueryParams;
};

const { Section } = Wrapper.Sidebar;

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

class Sidebar extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      filterParams: this.props.queryParams
    };
  }

  isFiltered = (): boolean => {
    const params = generateQueryParams(this.props.history);

    for (const param in params) {
      if (
        [
          'type',
          'startDate',
          'endDate',
          'jobReferId',
          'jobCategoryId',
          'productIds',
          'productCategoryId',
          'inBranchId',
          'inDepartmentId',
          'outBranchId',
          'outDepartmentId'
        ].includes(param)
      ) {
        return true;
      }
    }

    return false;
  };

  clearFilter = () => {
    const params = generateQueryParams(this.props.history);
    router.removeParams(this.props.history, ...Object.keys(params));
  };

  setFilter = (name, value) => {
    const { filterParams } = this.state;
    console.log(name, value);
    this.setState({ filterParams: { ...filterParams, [name]: value } });
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

  onSelectDate = (value, name) => {
    const strVal = moment(value).format('YYYY-MM-DD HH:mm');
    this.setFilter(name, strVal);
  };

  runFilter = () => {
    const { filterParams } = this.state;
    router.removeParams(this.props.history, 'page');
    router.setParams(this.props.history, { ...filterParams });
  };

  renderSpec() {
    const { filterParams } = this.state;

    if (!filterParams.type) {
      return '';
    }

    if (['end', 'job'].includes(filterParams.type)) {
      return (
        <>
          <FormGroup>
            <ControlLabel>Job Category</ControlLabel>
            <SelectJobCategory
              label="Choose product category"
              name="productCategoryId"
              initialValue={filterParams.productCategoryId || ''}
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
          {(filterParams.type === 'end' && (
            <FormGroup>
              <ControlLabel>Job Refer</ControlLabel>
              <SelectJobRefer
                key={'jobReferEnds'}
                label="Choose jobRefer"
                name="jobReferId"
                initialValue={filterParams.jobReferId || ''}
                customOption={{
                  value: '',
                  label: '...Clear jobRefer filter'
                }}
                onSelect={jobReferId =>
                  this.setFilter('jobReferId', jobReferId)
                }
                filterParams={{ types: ['end'] }}
                multi={false}
              />
            </FormGroup>
          )) || (
            <FormGroup>
              <ControlLabel>Job Refer</ControlLabel>
              <SelectJobRefer
                key={'jobReferJobs'}
                label="Choose jobRefer"
                name="jobReferId"
                initialValue={filterParams.jobReferId || ''}
                customOption={{
                  value: '',
                  label: '...Clear jobRefer filter'
                }}
                onSelect={jobReferId =>
                  this.setFilter('jobReferId', jobReferId)
                }
                filterParams={{ types: ['job'] }}
                multi={false}
              />
            </FormGroup>
          )}
        </>
      );
    }

    return (
      <>
        <FormGroup>
          <ControlLabel>Product Category</ControlLabel>
          <SelectProductCategory
            label="Choose product category"
            name="productCategoryId"
            initialValue={filterParams.productCategoryId || ''}
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
            name="productIds"
            initialValue={filterParams.productIds || []}
            customOption={{
              value: '',
              label: '...Clear product filter'
            }}
            onSelect={productIds => this.setFilter('productIds', productIds)}
            multi={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Vendor</ControlLabel>
          <SelectCompanies
            label="Choose vendor"
            name="vendorIds"
            initialValue={filterParams.vendorIds || []}
            customOption={{
              value: '',
              label: '...Clear product filter'
            }}
            onSelect={vendorIds => this.setFilter('vendorIds', vendorIds)}
            multi={true}
          />
        </FormGroup>
      </>
    );
  }

  render() {
    const { filterParams } = this.state;

    return (
      <Wrapper.Sidebar hasBorder>
        <Section.Title>
          {__('Filters')}
          <Section.QuickButtons>
            {this.isFiltered() && (
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
              <ControlLabel>Type</ControlLabel>
              <FormControl
                name="type"
                componentClass="select"
                value={filterParams.type}
                required={false}
                onChange={e =>
                  this.setFilter(
                    'type',
                    (e.currentTarget as HTMLInputElement).value
                  )
                }
              >
                <option value="">All type</option>
                {Object.keys(JOB_TYPE_CHOISES).map(jt => (
                  <option value={jt} key={Math.random()}>
                    {JOB_TYPE_CHOISES[jt]}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            {this.renderSpec()}
            <FormGroup>
              <ControlLabel>In Branch</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="inBranchId"
                initialValue={filterParams.inBranchId || ''}
                customOption={{
                  value: '',
                  label: '...Clear branch filter'
                }}
                onSelect={branchId => this.setFilter('inBranchId', branchId)}
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>In Department</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="inDepartmentId"
                initialValue={filterParams.inDepartmentId || ''}
                customOption={{
                  value: '',
                  label: '...Clear department filter'
                }}
                onSelect={departmentId =>
                  this.setFilter('inDepartmentId', departmentId)
                }
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Out Branch</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="outBranchId"
                initialValue={filterParams.outBranchId || ''}
                customOption={{
                  value: '',
                  label: '...Clear branch filter'
                }}
                onSelect={branchId => this.setFilter('outBranchId', branchId)}
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Out Department</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="outDepartmentId"
                initialValue={filterParams.outDepartmentId || ''}
                customOption={{
                  value: '',
                  label: '...Clear department filter'
                }}
                onSelect={departmentId =>
                  this.setFilter('outDepartmentId', departmentId)
                }
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>{__(`Start Date`)}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="startDate"
                  dateFormat="YYYY/MM/DD"
                  timeFormat={true}
                  placeholder="Choose date"
                  value={
                    filterParams.startDate ||
                    moment(new Date(new Date().setHours(0, 0, 0)))
                  }
                  onChange={value => this.onSelectDate(value, 'startDate')}
                />
              </DateContainer>
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>{__(`End Date`)}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="endDate"
                  dateFormat="YYYY/MM/DD"
                  timeFormat={true}
                  placeholder="Choose date"
                  value={
                    filterParams.endDate ||
                    moment(
                      new Date(
                        new Date().setHours(0, 0, 0) + 24 * 60 * 60 * 1000
                      )
                    )
                  }
                  onChange={value => this.onSelectDate(value, 'endDate')}
                />
              </DateContainer>
            </FormGroup>
          </List>
          <MenuFooter>
            <Button
              block={true}
              btnStyle="success"
              uppercase={false}
              onClick={this.runFilter}
              icon="filter"
            >
              {__('Filter')}
            </Button>
          </MenuFooter>
        </SidebarFilters>
      </Wrapper.Sidebar>
    );
  }
}

export default Sidebar;
