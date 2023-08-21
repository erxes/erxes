import Button from '@erxes/ui/src/components/Button';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils/core';
import DealConvertTrigger from '@erxes/ui-cards/src/deals/components/DealConvertTrigger';
import TaskConvertTrigger from '@erxes/ui-cards/src/tasks/components/TaskConvertTrigger';
import PurchaseConvertTrigger from '@erxes/ui-cards/src/purchases/components/PurchaseConvertTrigger';
import TicketConvertTrigger from '@erxes/ui-cards/src/tickets/components/TicketConvertTrigger';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import styled from 'styled-components';
import {
  IMessage,
  IConversation,
  IMail
} from '@erxes/ui-inbox/src/inbox/types';

const Container = styled.div`
  display: inline-block;

  .dropdown-menu {
    min-width: auto;
  }

  button {
    padding: 3px 7px 3px 12px;
    font-size: 10px;
  }
`;

type Props = {
  conversation: IConversation;
  conversationMessage: IMessage;
  convertToInfo: {
    ticketUrl?: string;
    dealUrl?: string;
    taskUrl?: string;
    purchaseUrl?: string;
  };
  refetch: () => void;
};

export default function ConvertTo(props: Props) {
  const { conversation, convertToInfo, conversationMessage, refetch } = props;

  const assignedUserIds = conversation.assignedUserId
    ? [conversation.assignedUserId]
    : [];
  const customerIds = conversation.customerId ? [conversation.customerId] : [];
  const sourceConversationId = conversation._id;

  const message: IMessage = conversationMessage || ({} as IMessage);
  const mailData = message.mailData || ({} as IMail);

  const triggerProps: any = {
    assignedUserIds,
    relTypeIds: customerIds,
    relType: 'customer',
    sourceConversationId,
    subject: mailData.subject ? mailData.subject : '',
    refetch
  };

  return (
    <Container>
      <Dropdown>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-convert-to">
          <Button>
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
            <DealConvertTrigger
              {...triggerProps}
              bookingProductId={conversation.bookingProductId}
              url={convertToInfo.dealUrl}
            />
          </li>
          <li key="task">
            <TaskConvertTrigger {...triggerProps} url={convertToInfo.taskUrl} />
          </li>
          <li key="purchase">
            <PurchaseConvertTrigger
              {...triggerProps}
              url={convertToInfo.purchaseUrl}
            />
          </li>
        </Dropdown.Menu>
      </Dropdown>
    </Container>
  );
}
