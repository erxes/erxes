import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import {
  ModalTrigger,
  Button,
  Icon,
  DropdownToggle,
  FormControl
} from 'modules/common/components';
import {
  Messenger,
  Form,
  Facebook
} from 'modules/settings/integrations/containers';
import { SearchField } from '../styles';

function RightActionBar() {
  const triggerMessenger = <MenuItem>Messenger</MenuItem>;
  const triggerForm = <MenuItem>Form</MenuItem>;
  const triggerFb = <MenuItem>Facebook page</MenuItem>;

  return (
    <div>
      <SearchField>
        <FormControl
          type="text"
          placeholder="Search for channels ..."
          autoFocus
          round
        />
      </SearchField>

      <Button btnStyle="simple" size="small">
        Filter <Icon icon="chevron-down" />
      </Button>

      <Button btnStyle="simple" size="small">
        Manage Brands <Icon icon="chevron-down" />
      </Button>

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
    </div>
  );
}

export default RightActionBar;
