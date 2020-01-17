import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import TextInfo from 'modules/common/components/TextInfo';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Capitalize } from '../styles';
import { IActions, IModule, IPermissionDocument, IUserGroup } from '../types';
import PermissionForm from './PermissionForm';
import { filterActions } from './utils';

type Props = {
  actions: IActions[];
  permission: IPermissionDocument;
  removeItem: (id: string) => void;
  modules: IModule[];
  groups: IUserGroup[];
  refetchQueries: any;
}

class PermissionRow extends React.Component<Props> {
  renderForm = props => {
    const { modules, actions, groups, permission, refetchQueries } = this.props;

    const extendedProps = {
      ...props,
      modules,
      actions,
      groups,
      refetchQueries,
      permission
    };

    return <PermissionForm {...extendedProps} />;
  }

  render() {
    const { permission, actions, removeItem } = this.props;

    const permissionAction = filterActions(actions, permission.module).filter(
      action => action.value === permission.action
    );

    return (
      <tr key={permission._id}>
        <td>
          <Capitalize>{permission.module}</Capitalize>
        </td>
        <td>{permissionAction.map(action => action.label)}</td>
        <td>{permission.user ? permission.user.email : ''}</td>
        <td>{permission.group ? permission.group.name : ''}</td>
        <td>
          {permission.allowed ? (
            <TextInfo textStyle="success">{__('Allowed')}</TextInfo>
          ) : (
              <TextInfo textStyle="danger">{__('Not Allowed')}</TextInfo>
            )}
        </td>
        <td>
          <ActionButtons>
            <Tip text="Delete">
              <Button btnStyle="link" onClick={removeItem.bind(null, permission._id)}>
                <Icon icon="cancel-1" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default PermissionRow;
