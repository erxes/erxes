import { IUser } from 'modules/auth/types';
import {
  ActionButtons,
  Button,
  DataWithLoader,
  Icon,
  ModalTrigger,
  Pagination,
  Table,
  TextInfo,
  Tip
} from 'modules/common/components';
import { __, router } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import Select from 'react-select-plus';
import { GroupList } from '../containers';
import { Capitalize, FilterItem, FilterWrapper, NotWrappable } from '../styles';
import { IActions, IModule, IPermissionDocument, IUserGroup } from '../types';
import PermissionForm from './PermissionForm';
import {
  correctValue,
  filterActions,
  generatedList,
  generateListParams,
  generateModuleParams
} from './utils';

type Props = {
  history: any;
  queryParams: any;
  isLoading: boolean;
  totalCount: number;
} & commonProps;

type commonProps = {
  modules: IModule[];
  actions: IActions[];
  users: IUser[];
  groups: IUserGroup[];
  permissions: IPermissionDocument[];
  remove: (id: string) => void;
  refetchQueries: any;
};

class PermissionList extends React.Component<Props> {
  setFilter = (name: string, item: generatedList) => {
    const { history } = this.props;

    router.setParams(history, {
      [name]: correctValue(item),
      page: null,
      perPage: null
    });
  };

  renderObjects() {
    const { permissions, actions, remove } = this.props;

    return permissions.map(object => {
      const permissionAction = filterActions(actions, object.module).filter(
        action => action.value === object.action
      );

      return (
        <tr key={object._id}>
          <td>
            <Capitalize>{object.module}</Capitalize>
          </td>
          <td>{permissionAction.map(action => action.label)}</td>
          <td>{object.user ? object.user.email : ''}</td>
          <td>{object.group ? object.group.name : ''}</td>
          <td>
            {object.allowed ? (
              <TextInfo textStyle="success">{__('Allowed')}</TextInfo>
            ) : (
              <TextInfo textStyle="danger">{__('Not Allowed')}</TextInfo>
            )}
          </td>
          <td>
            <ActionButtons>
              <Tip text="Delete">
                <Button btnStyle="link" onClick={remove.bind(null, object._id)}>
                  <Icon icon="cancel-1" />
                </Button>
              </Tip>
            </ActionButtons>
          </td>
        </tr>
      );
    });
  }

  renderContent() {
    return (
      <Table whiteSpace="nowrap" hover={true} bordered={true}>
        <thead>
          <tr>
            <th>Module</th>
            <th>Action</th>
            <th>Email</th>
            <th>Group</th>
            <th>Allow</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  renderForm = props => {
    const { modules, actions, users, groups, refetchQueries } = this.props;

    const extendedProps = {
      ...props,
      modules,
      actions,
      users,
      groups,
      refetchQueries
    };

    return <PermissionForm {...extendedProps} />;
  };

  renderActionBar() {
    const { queryParams, modules, actions, users } = this.props;

    const trigger = (
      <Button btnStyle="success" size="small" icon="add">
        New permission
      </Button>
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

    const actionBarLeft = (
      <FilterWrapper>
        <FilterItem>
          <Select
            placeholder={__('Choose module')}
            value={queryParams.module}
            options={generateModuleParams(modules)}
            onChange={this.setFilter.bind(this, 'module')}
          />
        </FilterItem>

        <FilterItem>
          <Select
            placeholder={__('Choose action')}
            value={queryParams.action}
            options={filterActions(actions, queryParams.module)}
            onChange={this.setFilter.bind(this, 'action')}
          />
        </FilterItem>
        <FilterItem>
          <Select
            placeholder={__('Choose user')}
            options={generateListParams(users)}
            onChange={this.setFilter.bind(this, 'userId')}
            value={queryParams.userId}
          />
        </FilterItem>
      </FilterWrapper>
    );

    return <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />;
  }

  render() {
    const { isLoading, totalCount, queryParams } = this.props;

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
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={isLoading}
            count={totalCount}
            emptyText="There is no permissions in this group"
            emptyImage="/images/actions/11.svg"
          />
        }
      />
    );
  }
}

export default PermissionList;
