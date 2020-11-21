import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import { FormControl } from 'modules/common/components/form';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { Title } from 'modules/common/styles/main';
import { __, router } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import Select from 'react-select-plus';
import { isObject } from 'util';
import GroupList from '../containers/GroupList';
import { FilterItem, FilterWrapper, NotWrappable } from '../styles';
import { IActions, IModule, IPermissionDocument, IUserGroup } from '../types';
import PermissionForm from './PermissionForm';
import PermissionRow from './PermissionRow';
import {
  correctValue,
  filterActions,
  generatedList,
  generateModuleParams
} from './utils';

type Props = {
  history: any;
  queryParams: any;
  isLoading: boolean;
  totalCount: number;
  currentGroupName?: string;
} & commonProps;

type commonProps = {
  modules: IModule[];
  actions: IActions[];
  groups: IUserGroup[];
  permissions: IPermissionDocument[];
  remove: (id: string) => void;
  refetchQueries: any;
};

class PermissionList extends React.Component<Props> {
  setFilter = (name: string, item: generatedList) => {
    const { history } = this.props;

    router.setParams(history, {
      [name]: isObject(item) ? correctValue(item) : item,
      page: null,
      perPage: null
    });
  };

  renderObjects() {
    const {
      groups,
      modules,
      permissions,
      actions,
      refetchQueries,
      remove
    } = this.props;

    return permissions.map(object => {
      return (
        <PermissionRow
          key={object._id}
          actions={actions}
          groups={groups}
          modules={modules}
          removeItem={remove}
          permission={object}
          refetchQueries={refetchQueries}
        />
      );
    });
  }

  renderFilter() {
    const { queryParams, modules, actions } = this.props;

    const usersOnChange = users => {
      this.setFilter('userId', users);
    };

    const allowedOnChange = e => {
      this.setFilter('allowed', {
        value: e.target.checked ? 'allowed' : 'notAllowed'
      });
    };

    return (
      <FilterWrapper>
        <strong>{__('Filters')}:</strong>
        <FilterItem id="permission-choose-module">
          <Select
            placeholder={__('Choose module')}
            value={queryParams.module}
            options={generateModuleParams(modules)}
            onChange={this.setFilter.bind(this, 'module')}
          />
        </FilterItem>

        <FilterItem id="permission-choose-action">
          <Select
            placeholder={__('Choose action')}
            value={queryParams.action}
            options={filterActions(actions, queryParams.module)}
            onChange={this.setFilter.bind(this, 'action')}
          />
        </FilterItem>
        <FilterItem id="permission-choose-users">
          <SelectTeamMembers
            label={__('Choose users')}
            name="userId"
            value={queryParams.userId}
            onSelect={usersOnChange}
            multi={false}
          />
        </FilterItem>

        <div>
          <strong>{__('Granted')}:</strong>
          <FormControl
            componentClass="checkbox"
            defaultChecked={queryParams.allowed !== 'notAllowed'}
            id="allowed"
            onChange={allowedOnChange}
          />
        </div>
      </FilterWrapper>
    );
  }

  renderData() {
    return (
      <Table whiteSpace="nowrap" hover={true} bordered={true}>
        <thead>
          <tr>
            <th>{__('Module')}</th>
            <th>{__('Action')}</th>
            <th>{__('Email')}</th>
            <th>{__('Group')}</th>
            <th>{__('Allow')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  renderForm = props => {
    const { modules, actions, groups, refetchQueries } = this.props;

    const extendedProps = {
      ...props,
      modules,
      actions,
      groups,
      refetchQueries
    };

    return <PermissionForm {...extendedProps} />;
  };

  renderActionBar() {
    const trigger = (
      <Button
        id="permission-new-permission"
        btnStyle="primary"
        icon="plus-circle"
        uppercase={false}
      >
        New permission
      </Button>
    );

    const title = (
      <Title>{this.props.currentGroupName || __('All permissions')}</Title>
    );

    const actionBarRight = (
      <NotWrappable>
        <ModalTrigger
          title="New permission"
          size="lg"
          trigger={trigger}
          content={this.renderForm}
        />
      </NotWrappable>
    );

    return (
      <Wrapper.ActionBar
        left={title}
        right={actionBarRight}
        background="colorWhite"
      />
    );
  }

  renderContent() {
    const { isLoading, totalCount } = this.props;

    return (
      <>
        {this.renderFilter()}
        <DataWithLoader
          data={this.renderData()}
          loading={isLoading}
          count={totalCount}
          emptyText={__('There is no permissions in this group')}
          emptyImage="/images/actions/11.svg"
        />
      </>
    );
  }

  render() {
    const { totalCount, queryParams } = this.props;

    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: __('Permissions') }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Permissions')} breadcrumb={breadcrumb} />
        }
        actionBar={this.renderActionBar()}
        leftSidebar={<GroupList queryParams={queryParams} />}
        footer={<Pagination count={totalCount} />}
        content={this.renderContent()}
      />
    );
  }
}

export default PermissionList;
