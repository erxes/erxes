import React, { useState } from 'react';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';
import { IUserGroupDocument } from '../../types';
import Select from 'react-select-plus';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  permissionGroup?: IUserGroupDocument;
  allUsers?: any;
  renderButton: (props: any) => void;
  closeModal?: () => void;
};

function PermissionGroupForm({
  permissionGroup = { users: [] },
  renderButton,
  closeModal,
  allUsers = []
}: Props) {
  const usersIds = permissionGroup.users.map(user => user._id);
  const [selectedUsers, setSelectedMembers] = useState(usersIds || []);
  const [name, setName] = useState(permissionGroup.name || '');
  console.log('permissionGroup.users', permissionGroup.users, selectedUsers);

  const handleSubmit = e => {
    e.preventDefault();
    console.log('name to render', name, selectedUsers);
    renderButton({
      _id: permissionGroup._id,
      name,
      ids: selectedUsers,
      object: permissionGroup
    });
  };

  const handleName = e => {
    setName(e.target.value);
    console.log('name', name);
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

      <ModalFooter id={'AddPermissionButtons'}>
        <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
          Cancel
        </Button>

        <Button btnStyle="success" type="submit" block={true}>
          Save
        </Button>
      </ModalFooter>
    </form>
  );
}

export default PermissionGroupForm;
