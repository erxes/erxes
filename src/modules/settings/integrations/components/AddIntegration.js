import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'react-bootstrap';
import {
  ModalTrigger,
  Button,
  Icon,
  DropdownToggle
} from 'modules/common/components';
import { Facebook } from '../containers';

function AddIntegration(props, { __ }) {
  const triggerFb = <MenuItem>{__('Facebook page')}</MenuItem>;

  return (
    <Dropdown id="dropdown-integration" pullRight>
      <DropdownToggle bsRole="toggle">
        <Button btnStyle="success" size="small" icon="add">
          {__('Add integrations')} <Icon icon="downarrow" />
        </Button>
      </DropdownToggle>
      <Dropdown.Menu>
        <MenuItem href="/settings/integrations/createMessenger">
          {__('Add messenger')}
        </MenuItem>

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
