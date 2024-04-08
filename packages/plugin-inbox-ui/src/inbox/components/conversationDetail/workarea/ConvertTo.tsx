import {
  IConversation,
  IMail,
  IMessage,
} from "@erxes/ui-inbox/src/inbox/types";

import Button from "@erxes/ui/src/components/Button";
import DealConvertTrigger from "@erxes/ui-cards/src/deals/components/DealConvertTrigger";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import Icon from "@erxes/ui/src/components/Icon";
import PurchaseConvertTrigger from "@erxes/ui-cards/src/purchases/components/PurchaseConvertTrigger";
import React from "react";
import TaskConvertTrigger from "@erxes/ui-cards/src/tasks/components/TaskConvertTrigger";
import TicketConvertTrigger from "@erxes/ui-cards/src/tickets/components/TicketConvertTrigger";
import { __ } from "@erxes/ui/src/utils/core";
import styled from "styled-components";

const Container = styled.div`
  display: inline-block;

  .dropdown-menu {
    min-width: auto;
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
    relType: "customer",
    sourceConversationId,
    subject: mailData.subject ? mailData.subject : "",
    refetch,
  };

  return (
    <Container>
      <Dropdown
        as={DropdownToggle}
        toggleComponent={
          <Button size="small" btnStyle="simple">
            {__("Convert")} <Icon icon="angle-down" />
          </Button>
        }
      >
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
      </Dropdown>
    </Container>
  );
}
