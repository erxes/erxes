import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import { IRouterProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { Option, PerPageButton } from './styles';

// per page chooser component
const PerPageChooser = ({ history }: IRouterProps) => {
  const currentPerPage = Number(router.getParam(history, 'perPage')) || 20;

  const onClick = perPage => {
    router.setParams(history, { perPage });
  };

  const renderOption = n => {
    return (
      <Option>
        <a href="#number" onClick={onClick.bind(null, n)}>
          {n}
        </a>
      </Option>
    );
  };

  return (
    <Dropdown id="per-page-chooser" className="dropup">
      <DropdownToggle bsRole="toggle">
        <PerPageButton>
          {currentPerPage} {__('per page')} <Icon icon="angle-up" />
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

export default withRouter<IRouterProps>(PerPageChooser);
