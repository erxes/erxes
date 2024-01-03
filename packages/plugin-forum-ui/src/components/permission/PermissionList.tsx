import {
  FilterItem,
  FilterWrapper
} from '@erxes/ui-settings/src/permissions/styles';
import { ICategory, IPermission, IUserGroupDocument } from '../../types';
import { __, router } from '@erxes/ui/src/utils';
import { correctValue, generateModuleParams, generatedList } from '../../utils';

import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import GroupList from '../../containers/permission/GroupList';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { PERMISSIONS } from '../../constants';
import PermissionForm from './PermissionForm';
import PermissionRow from '../../containers/permission/PermissionRow';
import React from 'react';
import Select from 'react-select-plus';
import Table from '@erxes/ui/src/components/table';
import { Title } from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isObject } from 'util';

type Props = {
  history: any;
  queryParams: any;
  refetchQueries: any;
  permissions: IPermission[];
  isLoading?: boolean;
  totalCount?: number;
  currentGroupName?: string;
  permissionGroups?: IUserGroupDocument[];
  categoryList?: ICategory[];
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
    return <PermissionRow permissions={this.props.permissions} />;
  }

  renderFilter() {
    const { queryParams, categoryList } = this.props;

    return (
      <FilterWrapper>
        <strong>{__('Filters')}:</strong>
        <FilterItem id="permission-choose-module">
          <Select
            placeholder={__('Choose category')}
            value={queryParams.categoryId}
            options={generateModuleParams(categoryList || [])}
            onChange={this.setFilter.bind(this, 'categoryId')}
          />
        </FilterItem>

        <FilterItem id="permission-choose-action">
          <Select
            placeholder={__('Choose permission')}
            value={queryParams.permission}
            options={generateModuleParams(PERMISSIONS)}
            onChange={this.setFilter.bind(this, 'permission')}
          />
        </FilterItem>
      </FilterWrapper>
    );
  }

  renderData() {
    return (
      <Table whiteSpace="nowrap" hover={true} bordered={true}>
        <thead>
          <tr>
            <th>{__('Category')}</th>
            <th>{__('Permission')}</th>
            <th>{__('Group')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  renderForm = props => {
    const { categoryList, queryParams, refetchQueries } = this.props;

    const extendedProps = {
      ...props,
      groupId: queryParams.groupId,
      categoryList,
      refetchQueries
    };

    return <PermissionForm {...extendedProps} />;
  };

  renderActionBar() {
    const trigger = (
      <Button
        id="permission-new-permission"
        btnStyle="success"
        icon="plus-circle"
      >
        New permission
      </Button>
    );

    const title = (
      <Title>{this.props.currentGroupName || __('All permissions')}</Title>
    );

    const actionBarRight = (
      <ModalTrigger
        title="New permission"
        size="lg"
        trigger={trigger}
        content={this.renderForm}
      />
    );

    return (
      <Wrapper.ActionBar
        left={title}
        right={actionBarRight}
        wideSpacing={true}
      />
    );
  }

  renderContent() {
    const { isLoading, permissions } = this.props;

    return (
      <>
        {this.renderFilter()}
        <DataWithLoader
          data={this.renderData()}
          loading={isLoading || false}
          count={permissions.length}
          emptyText={__('There is no permissions in this group')}
          emptyImage="/images/actions/11.svg"
        />
      </>
    );
  }

  render() {
    const { queryParams, permissionGroups } = this.props;

    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: __('Forum Permissions') }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Forum Permissions')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={this.renderActionBar()}
        leftSidebar={
          <GroupList
            permissionGroups={permissionGroups}
            queryParams={queryParams}
          />
        }
        content={this.renderContent()}
        center={false}
        hasBorder={true}
      />
    );
  }
}

export default PermissionList;
