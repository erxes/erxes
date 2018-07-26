import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
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
        <li>
          <Link to={`/settings/integrations/createMessenger`}>
            {__('Add messenger')}
          </Link>
        </li>
        <ModalTrigger title="Add facebook page" trigger={triggerFb}>
          <Facebook />
        </ModalTrigger>
        <li>
          <Link to={`/settings/integrations/twitter`}>{__('Twitter')}</Link>
        </li>
      </Dropdown.Menu>
    </Dropdown>
  );
}

AddIntegration.contextTypes = {
  __: PropTypes.func
};

export default AddIntegration;
