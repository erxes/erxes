import * as React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { router } from 'modules/common/utils';
import { Icon, DropdownToggle } from 'modules/common/components';
import { PerPageButton, Option } from './styles';
import { Dropdown } from 'react-bootstrap';

// per page chooser component
const PerPageChooser = ({ history }, { __ }) => {
  const currentPerPage = Number(router.getParam(history, 'perPage')) || 20;

  const onClick = perPage => {
    router.setParams(history, { perPage });
  };

  const renderOption = n => {
    return (
      <Option>
        <a onClick={() => onClick(n)}>{n}</a>
      </Option>
    );
  };

  return (
    <Dropdown id="per-page-chooser" className="dropup">
      <DropdownToggle bsRole="toggle">
        <PerPageButton>
          {currentPerPage} {__('per page')} <Icon icon="uparrow-2" />
        </PerPageButton>
      </DropdownToggle>
      <Dropdown.Menu>
        {renderOption(20)}
        {renderOption(50)}
        {renderOption(100)}
        {renderOption(200)}
      </Dropdown.Menu>
    </Dropdown>
  );
};

PerPageChooser.propTypes = {
  history: PropTypes.object.isRequired
};

PerPageChooser.contextTypes = {
  __: PropTypes.func
};

export default withRouter(PerPageChooser);
