import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import DealAddTrigger from 'modules/deals/components/DealAddTrigger';
import TaskAddTrigger from 'modules/tasks/components/TaskAddTrigger';
import TicketAddTrigger from 'modules/tickets/components/TicketAddTrigger';
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import styled from 'styled-components';

const Container = styled.div`
  display: inline-block;

  .dropdown-menu {
    min-width: auto;
  }

  button {
    padding: 3px 12px;
    font-size: 9px;
  }
`;

type Props = {
  customerIds?: string[];
};

export default (props: Props) => {
  return (
    <Container>
      <Dropdown id="dropdown-convert-to">
        <DropdownToggle bsRole="toggle">
          <Button size="small">
            {__('Convert to')} <Icon icon="angle-down" />
          </Button>
        </DropdownToggle>
        <Dropdown.Menu>
          <li key="ticket">
            <TicketAddTrigger customerIds={props.customerIds} />
          </li>
          <li key="deal">
            <DealAddTrigger customerIds={props.customerIds} />
          </li>
          <li key="task">
            <TaskAddTrigger customerIds={props.customerIds} />
          </li>
        </Dropdown.Menu>
      </Dropdown>
    </Container>
  );
};
