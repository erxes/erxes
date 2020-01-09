import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import DealConvertTrigger from 'modules/deals/components/DealConvertTrigger';
import { IConversation } from 'modules/inbox/types';
import TaskConvertTrigger from 'modules/tasks/components/TaskConvertTrigger';
import TicketConvertTrigger from 'modules/tickets/components/TicketConvertTrigger';
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
  conversation: IConversation;
  convertToInfo: {
    ticketUrl?: string;
    dealUrl?: string;
    taskUrl?: string;
  };
  refetch: () => void;
};

export default (props: Props) => {
  const { conversation, convertToInfo, refetch } = props;

  const assignedUserIds = conversation.assignedUserId
    ? [conversation.assignedUserId]
    : [];
  const customerIds = conversation.customerId ? [conversation.customerId] : [];
  const sourceConversationId = conversation._id;

  const triggerProps = {
    assignedUserIds,
    relTypeIds: customerIds,
    relType: 'customer',
    sourceConversationId,
    refetch
  };

  return (
    <Container>
      <Dropdown>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-convert-to">
          <Button size="small">
            {__('Convert')} <Icon icon="angle-down" />
          </Button>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <li key="ticket">
            <TicketConvertTrigger
              {...triggerProps}
              url={convertToInfo.ticketUrl}
            />
          </li>
          <li key="deal">
            <DealConvertTrigger {...triggerProps} url={convertToInfo.dealUrl} />
          </li>
          <li key="task">
            <TaskConvertTrigger {...triggerProps} url={convertToInfo.taskUrl} />
          </li>
        </Dropdown.Menu>
      </Dropdown>
    </Container>
  );
};
