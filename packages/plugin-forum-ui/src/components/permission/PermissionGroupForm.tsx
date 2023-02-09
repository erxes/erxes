import { IClientPortalUser, IUserGroupDocument } from '../../types';
import React, { useState } from 'react';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '../../styles';
import Select from 'react-select-plus';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  permissionGroup?: IUserGroupDocument;
  allUsers?: IClientPortalUser[];
  onSave: (props: any) => void;
  closeModal: () => void;
};

function PermissionGroupForm({
  permissionGroup = { users: [] } as IUserGroupDocument,
  onSave,
  closeModal,
  allUsers = [] as IClientPortalUser[]
}: Props) {
  const usersIds = permissionGroup.users.map(user => user._id);
  const [selectedUsers, setSelectedMembers] = useState(usersIds || []);
  const [name, setName] = useState(permissionGroup.name || '');

  const handleSubmit = e => {
    e.preventDefault();

    onSave({
      _id: permissionGroup._id,
      name,
      ids: selectedUsers,
      object: permissionGroup
    });

    closeModal();
  };

  const handleName = e => {
    setName(e.target.value);
  };

  const onChange = members => {
    const ids = members.map(m => m._id);
    setSelectedMembers(ids);
  };

  const renderOptions = () => {
    return allUsers.map(user => ({
      value: user._id,
      label: user.username || user.firstName || user.email,
      _id: user._id
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup>
        <ControlLabel required={true}>Name</ControlLabel>
        <FormControl
          name="name"
          onChange={handleName}
          defaultValue={name}
          required={true}
          autoFocus={true}
        />
      </FormGroup>

      {permissionGroup._id && (
        <FormGroup>
          <ControlLabel>Users</ControlLabel>

          <Select
            placeholder={__('Choose users')}
            options={renderOptions()}
            value={selectedUsers}
            onChange={onChange}
            multi={true}
          />
        </FormGroup>
      )}

      <ModalFooter id={'AddPermissionButtons'}>
        <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
          Cancel
        </Button>

        <Button
          btnStyle="success"
          className="submit"
          icon="check-circle"
          type="submit"
          block={true}
        >
          Save
        </Button>
      </ModalFooter>
    </form>
  );
}

export default PermissionGroupForm;
