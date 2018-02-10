import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { router } from 'modules/common/utils';
import { Icon, DropdownToggle, Button } from 'modules/common/components';
import { Dropdown } from 'react-bootstrap';

// per page chooser component
const PerPageChooser = ({ history }) => {
  const currentPerPage = Number(router.getParam(history, 'perPage')) || 20;

  const onClick = perPage => {
    router.setParams(history, { perPage });
  };

  const renderOption = number => {
    return (
      <li>
        <a onClick={() => onClick(number)}>{number}</a>
      </li>
    );
  };

  return (
    <span>
      <Dropdown id="dropdown-engage">
        <DropdownToggle bsRole="toggle">
          <Button btnStyle="simple" size="small">
            {currentPerPage} <Icon icon="ios-arrow-down" />
          </Button>
        </DropdownToggle>
        <Dropdown.Menu>
          {renderOption(20)}
          {renderOption(50)}
          {renderOption(100)}
          {renderOption(200)}
        </Dropdown.Menu>
      </Dropdown>
      &nbsp;rows per page
    </span>
  );
};

PerPageChooser.propTypes = {
  history: PropTypes.object.isRequired
};

export default withRouter(PerPageChooser);
