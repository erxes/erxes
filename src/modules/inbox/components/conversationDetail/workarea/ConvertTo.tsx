import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import DealAddTrigger from 'modules/deals/components/DealAddTrigger';
import TaskAddTrigger from 'modules/tasks/components/TaskAddTrigger';
import TicketAddTrigger from 'modules/tickets/components/TicketAddTrigger';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
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
  assignedUserIds?: string[];
};

export default (props: Props) => {
  return (
    <Container>
      <Dropdown>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-convert-to">
          <Button size="small">
            {__('Convert to')} <Icon icon="angle-down" />
          </Button>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <li key="ticket">
            <TicketAddTrigger
              assignedUserIds={props.assignedUserIds}
              relTypeIds={props.customerIds}
              relType="customer"
            />
          </li>
          <li key="deal">
            <DealAddTrigger
              assignedUserIds={props.assignedUserIds}
              relTypeIds={props.customerIds}
              relType="customer"
            />
          </li>
          <li key="task">
            <TaskAddTrigger
              assignedUserIds={props.assignedUserIds}
              relTypeIds={props.customerIds}
              relType="customer"
            />
          </li>
        </Dropdown.Menu>
      </Dropdown>
    </Container>
  );
};
