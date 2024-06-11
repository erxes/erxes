import {
  IConversation,
  IMail,
  IMessage,
} from "@erxes/ui-inbox/src/inbox/types";

import Button from "@erxes/ui/src/components/Button";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import Icon from "@erxes/ui/src/components/Icon";
import React, { useState } from "react";
import { __ } from "@erxes/ui/src/utils/core";
import styled from "styled-components";
import { options as ticketOptions } from "@erxes/ui-cards/src/tickets/options";
import { options as dealOptions } from "@erxes/ui-cards/src/deals/options";
import { options as taskOptions } from "@erxes/ui-cards/src/tasks/options";
import { options as purchaseOptions } from "@erxes/ui-cards/src/purchases/options";
import AddForm from "@erxes/ui-cards/src/boards/containers/portable/AddForm";

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
  const [options, setOptions] = useState({} as any);

  const assignedUserIds = conversation.assignedUserId
    ? [conversation.assignedUserId]
    : [];
  const customerIds = conversation.customerId ? [conversation.customerId] : [];
  const sourceConversationId = conversation._id;

  const message: IMessage = conversationMessage || ({} as IMessage);
  const mailData = message.mailData || ({} as IMail);

  const ticketTitle = convertToInfo.ticketUrl
    ? __("Go to a ticket")
    : __("Convert to a ticket");
  const taskTitle = convertToInfo.taskUrl
    ? __("Go to a task")
    : __("Convert to a task");
  const dealTitle = convertToInfo.dealUrl
    ? __("Go to a deal")
    : __("Convert to a deal");
  const purchaseTitle = convertToInfo.purchaseUrl
    ? __("Go to a purchase")
    : __("Convert to a purchase");

  const addForm = (props) => (
    <AddForm
      options={options}
      {...props}
      type={props.type}
      description={props.description}
      attachments={props.attachments}
      refetch={refetch}
      relType={"customer"}
      relTypeIds={customerIds}
      mailSubject={mailData.subject ? mailData.subject : ""}
      assignedUserIds={assignedUserIds}
      sourceConversationId={sourceConversationId}
      showSelect={true}
      bookingProductId={conversation.bookingProductId}
    />
  );

  const menuItems = [
    {
      title: ticketTitle,
      trigger: !convertToInfo.ticketUrl && (
        <li key="ticket" onClick={() => setOptions(ticketOptions)}>
          <a id="showTicketConvertModal">{ticketTitle}</a>
        </li>
      ),
      content: addForm,
    },
    {
      title: dealTitle,
      trigger: !convertToInfo.dealUrl && (
        <li key="deal" onClick={() => setOptions(dealOptions)}>
          <a id="showDealConvertModal">{dealTitle}</a>
        </li>
      ),
      content: addForm,
    },
    {
      title: taskTitle,
      trigger: !convertToInfo.taskUrl && (
        <li key="task" onClick={() => setOptions(taskOptions)}>
          <a id="showTaskConvertModal">{taskTitle}</a>
        </li>
      ),
      content: addForm,
    },
    {
      title: purchaseTitle,
      trigger: !convertToInfo.purchaseUrl && (
        <li key="purchase" onClick={() => setOptions(purchaseOptions)}>
          <a id="showPurchaseConvertModal">{purchaseTitle}</a>
        </li>
      ),
      content: addForm,
    },
  ];

  const gotoTrigger = (url, autoOpenKey, title) => {
    return url && (
      <a
        onClick={() => {
          window.open(url, "_blank");
        }}
        id={autoOpenKey}
      >
        {title}
      </a>
    );
  };

  return (
    <Container>
      <Dropdown
        as={DropdownToggle}
        isMenuWidthFit={true}
        toggleComponent={
          <Button size="small" btnStyle="simple">
            {__("Convert")} <Icon icon="angle-down" />
          </Button>
        }
        unmount={false}
        modalMenuItems={menuItems}
      >
        <>
          {gotoTrigger(
            convertToInfo.ticketUrl,
            "showTicketConvertModal",
            ticketTitle
          )}
          {gotoTrigger(
            convertToInfo.taskUrl,
            "showTaskConvertModal",
            taskTitle
          )}
          {gotoTrigger(
            convertToInfo.dealUrl,
            "showDealConvertModal",
            dealTitle
          )}
          {gotoTrigger(
            convertToInfo.purchaseUrl,
            "showPurchaseConvertModal",
            purchaseTitle
          )}
        </>
      </Dropdown>
    </Container>
  );
}
