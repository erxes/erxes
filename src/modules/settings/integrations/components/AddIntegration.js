import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import {
  ModalTrigger,
  Button,
  Icon,
  DropdownToggle
} from 'modules/common/components';
import { Messenger, Form, Facebook } from '../containers';

function AddIntegration() {
  const triggerMessenger = <MenuItem>Add messenger</MenuItem>;

  const triggerForm = <MenuItem>Add form</MenuItem>;

  const triggerFb = <MenuItem>Add facebook page</MenuItem>;

  return (
    <Dropdown id="dropdown-integration" pullRight>
      <DropdownToggle bsRole="toggle">
        <Button btnStyle="success" size="small">
          Add integrations <Icon icon="chevron-down" />
        </Button>
      </DropdownToggle>
      <Dropdown.Menu>
        <ModalTrigger title="Add messenger" trigger={triggerMessenger}>
          <Messenger />
        </ModalTrigger>

        <ModalTrigger title="Add form" trigger={triggerForm}>
          <Form />
        </ModalTrigger>

        <ModalTrigger title="Add facebook page" trigger={triggerFb}>
          <Facebook />
        </ModalTrigger>

        <MenuItem href="/settings/integrations/twitter">Add twitter</MenuItem>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default AddIntegration;
