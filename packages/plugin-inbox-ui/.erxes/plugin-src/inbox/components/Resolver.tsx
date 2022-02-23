import Button from "@erxes/ui/src/components/Button";
import { CONVERSATION_STATUSES } from "../constants";
import React from "react";
import { IConversation } from "@erxes/ui-inbox/src/inbox/types";
import { __ } from "coreui/utils";

type Props = {
  conversations: IConversation[];
  changeStatus: (conversationIds: string[], status: string) => void;
};

class Resolver extends React.Component<Props> {
  changeStatus = (status: string) => {
    const { conversations, changeStatus } = this.props;

    // call change status method
    changeStatus(
      conversations.map((c) => {
        return c._id;
      }),
      status
    );
  };

  render() {
    const hasClosedConversation = this.props.conversations.find(
      (conversation) => conversation.status === CONVERSATION_STATUSES.CLOSED
    );

    const buttonText = hasClosedConversation ? "Open" : "Resolve";
    const icon = hasClosedConversation ? "redo" : "check-circle";

    const btnAttrs = {
      size: "small",
      btnStyle: hasClosedConversation ? "warning" : "success",
      icon,
      onClick: hasClosedConversation
        ? () => {
            this.changeStatus(CONVERSATION_STATUSES.OPEN);
          }
        : () => {
            this.changeStatus(CONVERSATION_STATUSES.CLOSED);
          },
    };

    return (
      <>
        <Button {...btnAttrs}>{__(buttonText)}</Button>
      </>
    );
  }
}

export default Resolver;
