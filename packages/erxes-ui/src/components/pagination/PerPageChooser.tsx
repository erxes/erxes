import DropdownToggle from '../DropdownToggle';
import Icon from '../Icon';
import { IRouterProps } from '../../types';
import { __, router } from '../../utils/core';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { withRouter } from 'react-router-dom';
import { Option, PerPageButton } from './styles';

type Props = {
  count?: number;
} & IRouterProps;

// per page chooser component
const PerPageChooser = ({ history }: Props) => {
  const currentPerPage = Number(router.getParam(history, 'perPage')) || 20;

  const onClick = perPage => {
    if (perPage !== currentPerPage) {
      router.setParams(history, { perPage });
      router.setParams(history, { page: 1 });

      const storageValue = window.localStorage.getItem('pagination:perPage');

      let items = {};

      if (storageValue) {
        items = JSON.parse(storageValue);
      }

      items[window.location.pathname] = perPage;

      window.localStorage.setItem('pagination:perPage', JSON.stringify(items));
    }
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
    <Dropdown className="dropdown-btn" drop="up">
      <Dropdown.Toggle as={DropdownToggle} id="per-page-chooser">
        <PerPageButton>
          {currentPerPage} {__('per page')} <Icon icon="angle-up" />
        </PerPageButton>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {renderOption(20)}
        {renderOption(50)}
        {renderOption(100)}
        {renderOption(200)}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default withRouter<Props>(PerPageChooser);
