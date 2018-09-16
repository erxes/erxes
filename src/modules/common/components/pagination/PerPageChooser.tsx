import { DropdownToggle, Icon } from 'modules/common/components';
import { __, router } from 'modules/common/utils';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { Option, PerPageButton } from './styles';

type Props= {
  history: any,
  location: any,
  match: any,
};

// per page chooser component
const PerPageChooser = ({ history }: Props) => {
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


export default withRouter<Props>(PerPageChooser);
