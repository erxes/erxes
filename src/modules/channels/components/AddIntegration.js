import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import {
  ModalTrigger,
  Button,
  Icon,
  DropdownToggle
} from 'modules/common/components';
import {
  Messenger,
  Form,
  Facebook
} from 'modules/settings/integrations/containers';

function AddIntegration() {
  const triggerMessenger = <MenuItem>Messenger</MenuItem>;

  const triggerForm = <MenuItem>Form</MenuItem>;

  const triggerFb = <MenuItem>Facebook page</MenuItem>;

  return (
    <Dropdown id="dropdown-integration" pullRight>
      <DropdownToggle bsRole="toggle">
        <Button btnStyle="success" size="small">
          <Icon icon="plus" />
          Add integration <Icon icon="chevron-down" />
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

        <MenuItem href="/settings/integrations/twitter">Twitter</MenuItem>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default AddIntegration;
