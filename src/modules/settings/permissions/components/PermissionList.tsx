import { IUser } from 'modules/auth/types';
import {
  Button,
  DataWithLoader,
  FormControl,
  Icon,
  ModalTrigger,
  Pagination,
  Table,
  Tip
} from 'modules/common/components';
import { __, router } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { BarItems } from 'modules/layout/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select-plus';
import { FilterWrapper } from '../styles';
import {
  IActions,
  IModule,
  IPermissionDocument,
  IPermissionParams,
  IUserGroup
} from '../types';
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
  save: (doc: IPermissionParams, callback: () => void) => void;
  remove: (id: string) => void;
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
    const { permissions, remove } = this.props;

    return permissions.map(object => {
      return (
        <tr key={object._id}>
          <td>{object.module}</td>
          <td>{object.action}</td>
          <td>{object.user ? object.user.email : ''}</td>
          <td>{object.group ? object.group.name : ''}</td>
          <td>
            <FormControl
              componentClass="checkbox"
              disabled={true}
              defaultChecked={object.allowed}
            />
          </td>
          <td>
            <Tip text="Delete">
              <Button type="success" onClick={remove.bind(null, object._id)}>
                <Icon icon="trash" />
              </Button>
            </Tip>
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
    const { modules, actions, users, groups, save } = this.props;

    const extendedProps = {
      ...props,
      modules,
      actions,
      users,
      groups,
      save
    };

    return <PermissionForm {...extendedProps} />;
  };

  renderActionBar() {
    const { queryParams, modules, actions, groups, users } = this.props;

    const trigger = (
      <Button btnStyle="primary" size="small" icon="plus">
        New Permission
      </Button>
    );

    const actionBarRight = (
      <BarItems>
        <ModalTrigger
          title="New Permission"
          size={'lg'}
          trigger={trigger}
          content={this.renderForm}
        />
        <Link to="/settings/users/groups">
          <Button type="success" size="small">
            User groups
          </Button>
        </Link>
      </BarItems>
    );

    const actionBarLeft = (
      <React.Fragment>
        <FilterWrapper>
          <Select
            placeholder={__('Choose module')}
            value={queryParams.module}
            options={generateModuleParams(modules)}
            onChange={this.setFilter.bind(this, 'module')}
          />
        </FilterWrapper>

        <FilterWrapper>
          <Select
            placeholder={__('Choose action')}
            value={queryParams.action}
            options={filterActions(actions, queryParams.module)}
            onChange={this.setFilter.bind(this, 'action')}
          />
        </FilterWrapper>
        <FilterWrapper>
          <Select
            placeholder={__('Choose group')}
            options={generateListParams(groups)}
            onChange={this.setFilter.bind(this, 'groupId')}
            value={queryParams.groupId}
          />
        </FilterWrapper>

        <FilterWrapper>
          <Select
            placeholder={__('Choose user')}
            options={generateListParams(users)}
            onChange={this.setFilter.bind(this, 'userId')}
            value={queryParams.userId}
          />
        </FilterWrapper>
      </React.Fragment>
    );

    return <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />;
  }

  render() {
    const { isLoading, totalCount } = this.props;

    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: 'Permissions' }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={this.renderActionBar()}
        footer={<Pagination count={totalCount} />}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={isLoading}
            count={totalCount}
            emptyText="There is no data."
            emptyImage="/images/actions/11.svg"
          />
        }
      />
    );
  }
}

export default PermissionList;
