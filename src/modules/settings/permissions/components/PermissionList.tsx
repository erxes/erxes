import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import { FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import TextInfo from 'modules/common/components/TextInfo';
import Tip from 'modules/common/components/Tip';
import { __, router } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import Select from 'react-select-plus';
import { isObject } from 'util';
import GroupList from '../containers/GroupList';
import { Capitalize, FilterItem, FilterWrapper, NotWrappable } from '../styles';
import { IActions, IModule, IPermissionDocument, IUserGroup } from '../types';
import PermissionForm from './PermissionForm';
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
    const { queryParams, modules, actions } = this.props;

    const trigger = (
      <Button btnStyle="success" size="small" icon="add">
        New permission
      </Button>
    );

    const usersOnChange = users => {
      this.setFilter('userId', users);
    };

    const allowedOnChange = e => {
      this.setFilter('allowed', {
        value: e.target.checked ? 'allowed' : 'notAllowed'
      });
    };

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
          <SelectTeamMembers
            label="Choose users"
            name="userId"
            value={queryParams.userId}
            onSelect={usersOnChange}
            multi={false}
          />
        </FilterItem>

        <FilterItem>
          <div style={{ marginTop: '5px' }}>
            <label>Granted: </label>
            <FormControl
              componentClass="checkbox"
              defaultChecked={queryParams.allowed !== 'notAllowed'}
              id="allowed"
              onChange={allowedOnChange}
            />
          </div>
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
