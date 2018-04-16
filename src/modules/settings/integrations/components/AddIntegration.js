import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'react-bootstrap';
import {
  ModalTrigger,
  Button,
  Icon,
  DropdownToggle
} from 'modules/common/components';
import { Messenger, Facebook } from '../containers';

function AddIntegration(props, { __ }) {
  const triggerMessenger = <MenuItem>{__('Messenger')}</MenuItem>;

  const triggerFb = <MenuItem>{__('Facebook page')}</MenuItem>;

  return (
    <Dropdown id="dropdown-integration" pullRight>
      <DropdownToggle bsRole="toggle">
        <Button btnStyle="success" size="small" icon="plus">
          {__('Add integrations')} <Icon erxes icon="downarrow" />
        </Button>
      </DropdownToggle>
      <Dropdown.Menu>
        <ModalTrigger title="Add messenger" trigger={triggerMessenger}>
          <Messenger />
        </ModalTrigger>

        <ModalTrigger title="Add facebook page" trigger={triggerFb}>
          <Facebook />
        </ModalTrigger>

        <MenuItem href="/settings/integrations/twitter">
          {__('Twitter')}
        </MenuItem>
      </Dropdown.Menu>
    </Dropdown>
  );
}

AddIntegration.contextTypes = {
  __: PropTypes.func
};

export default AddIntegration;
