import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Tip from '@erxes/ui/src/components/Tip';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { router } from '@erxes/ui/src/utils';
import { __ } from 'coreui/utils';
import { IFlowCategory } from '../../types';
import { Link } from 'react-router-dom';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import FormControl from '@erxes/ui/src/components/form/Control';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  flowCategories: IFlowCategory[];
  loading: boolean;
  flowCategoriesCount: number;
}

class List extends React.Component<IProps> {
  clearCategoryFilter = () => {
    router.setParams(this.props.history, { categoryId: null });
  };

  clearLocationFilter = () => {
    router.setParams(this.props.history, {
      branchId: null,
      departmentId: null
    });
  };

  clearStatusFilter = () => {
    router.setParams(this.props.history, { status: null, validation: null });
  };

  isActive = (id: string) => {
    const { queryParams } = this.props;
    const currentGroup = queryParams.categoryId || '';

    return currentGroup === id;
  };

  setFilter = (name, value) => {
    router.setParams(this.props.history, { [name]: value });
  };

  renderContent() {
    const { flowCategories } = this.props;

    const result: React.ReactNode[] = [
      <SidebarListItem
        key={'unknownCategory'}
        isActive={this.isActive('unknownCategory')}
      >
        <Link to={`?categoryId=${'unknownCategory'}`}>
          {__('!Unknown Category')}
        </Link>
      </SidebarListItem>
    ];

    for (const category of flowCategories) {
      const order = category.order || '';

      const m = order.match(/[/]/gi);

      let space = '';

      if (m) {
        space = '\u00a0\u00a0'.repeat(m.length);
      }

      const name = category.isRoot ? (
        `${category.name} (${category.flowCount || 0})`
      ) : (
        <span>
          {category.name} ({category.flowCount || 0})
        </span>
      );

      result.push(
        <SidebarListItem
          key={category._id}
          isActive={this.isActive(category._id)}
        >
          <Link to={`?categoryId=${category._id}`}>
            {space}
            {name}
          </Link>
        </SidebarListItem>
      );
    }

    return result;
  }

  renderCategoryHeader() {
    return (
      <Section.Title>
        {__('Categories')}

        <Section.QuickButtons>
          {router.getParam(this.props.history, 'categoryId') && (
            <a href="#cancel" tabIndex={0} onClick={this.clearCategoryFilter}>
              <Tip text={__('Clear filter')} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </Section.QuickButtons>
      </Section.Title>
    );
  }

  renderCategoryList() {
    const { flowCategoriesCount, loading } = this.props;

    return (
      <SidebarList>
        <DataWithLoader
          data={this.renderContent()}
          loading={loading}
          count={flowCategoriesCount}
          emptyText="There is no flow category"
          emptyIcon="folder-2"
          size="small"
        />
      </SidebarList>
    );
  }

  render() {
    const { queryParams } = this.props;

    return (
      <Sidebar wide={true} hasBorder={true}>
        <Section
          maxHeight={488}
          collapsible={this.props.flowCategoriesCount > 9}
        >
          {this.renderCategoryHeader()}
          {this.renderCategoryList()}
        </Section>
        <Section>
          <Section.Title>
            {__('Latest job location')}

            <Section.QuickButtons>
              {(router.getParam(this.props.history, 'branchId') ||
                router.getParam(this.props.history, 'departmentId')) && (
                <a
                  href="#cancel"
                  tabIndex={0}
                  onClick={this.clearLocationFilter}
                >
                  <Tip text={__('Clear filter')} placement="bottom">
                    <Icon icon="cancel-1" />
                  </Tip>
                </a>
              )}
            </Section.QuickButtons>
          </Section.Title>
          <SidebarList>
            <FormGroup>
              <ControlLabel>Branch</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="selectedBranchId"
                initialValue={queryParams.branchId}
                customOption={{ value: '', label: 'Skip branch' }}
                onSelect={branchId => this.setFilter('branchId', branchId)}
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Department</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="selectedDepartmentId"
                initialValue={queryParams.departmentId}
                customOption={{ value: '', label: 'Skip department' }}
                onSelect={departmentId =>
                  this.setFilter('departmentId', departmentId)
                }
                multi={false}
              />
            </FormGroup>
          </SidebarList>
        </Section>
        <Section>
          <Section.Title>
            {__('Status')}

            <Section.QuickButtons>
              {(router.getParam(this.props.history, 'status') ||
                router.getParam(this.props.history, 'validation')) && (
                <a href="#cancel" tabIndex={0} onClick={this.clearStatusFilter}>
                  <Tip text={__('Clear filter')} placement="bottom">
                    <Icon icon="cancel-1" />
                  </Tip>
                </a>
              )}
            </Section.QuickButtons>
          </Section.Title>
          <SidebarList>
            <FormGroup>
              <ControlLabel>Status</ControlLabel>
              <FormControl
                name="status"
                componentClass="select"
                defaultValue={queryParams.status}
                required={false}
                onChange={e =>
                  this.setFilter(
                    'status',
                    (e.currentTarget as HTMLInputElement).value
                  )
                }
              >
                <option key={''} value={''}>
                  {' '}
                  {'Not deleted'}{' '}
                </option>
                <option key={'active'} value={'active'}>
                  {' '}
                  {'active'}{' '}
                </option>
                <option key={'draft'} value={'draft'}>
                  {' '}
                  {'draft'}{' '}
                </option>
                <option key={'deleted'} value={'deleted'}>
                  {' '}
                  {'deleted'}{' '}
                </option>
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Validation</ControlLabel>
              <FormControl
                name="validation"
                componentClass="select"
                defaultValue={queryParams.validation}
                required={false}
                onChange={e =>
                  this.setFilter(
                    'validation',
                    (e.currentTarget as HTMLInputElement).value
                  )
                }
              >
                <option key={''} value={''}>
                  {' '}
                  {'Any validation'}{' '}
                </option>
                <option key={'true'} value={'true'}>
                  {' '}
                  {'true'}{' '}
                </option>
                <option key={'Has not jobs'} value={'Has not jobs'}>
                  {' '}
                  {'Has not jobs'}{' '}
                </option>
                <option
                  key={'Has not endPoint job'}
                  value={'Has not endPoint job'}
                >
                  {' '}
                  {'Has not endPoint job'}{' '}
                </option>
                <option key={'Many endPoint jobs'} value={'Many endPoint jobs'}>
                  {' '}
                  {'Many endPoint jobs'}{' '}
                </option>
                <option key={'Has not latest job'} value={'Has not latest job'}>
                  {' '}
                  {'Has not latest job'}{' '}
                </option>
                <option key={'Many latest jobs'} value={'Many latest jobs'}>
                  {' '}
                  {'Many latest jobs'}{' '}
                </option>
                <option key={'less products'} value={'less products'}>
                  {' '}
                  {'less products'}{' '}
                </option>
                <option
                  key={'wrong Spend Department'}
                  value={'wrong Spend Department'}
                >
                  {' '}
                  {'wrong Spend Department'}{' '}
                </option>
                <option key={'wrong Spend Branch'} value={'wrong Spend Branch'}>
                  {' '}
                  {'wrong Spend Branch'}{' '}
                </option>
              </FormControl>
            </FormGroup>
          </SidebarList>
        </Section>
      </Sidebar>
    );
  }
}

export default List;
