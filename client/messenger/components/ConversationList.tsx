import * as React from "react";
import { __ } from "../../utils";
import { ConversationItem } from "../containers";
import { IConversation } from "../types";

type Props = {
  conversations: IConversation[];
  goToConversation: (conversationId: string) => void;
  loading: boolean;
};

function ConversationList(props: Props) {
  const { conversations, goToConversation, loading } = props;

  return (
    <ul className="erxes-conversation-list">
      {loading && <div className="loader bigger" />}
      {conversations.map(conversation => (
        <ConversationItem
          key={conversation._id}
          conversation={conversation}
          goToConversation={goToConversation}
        />
      ))}
    </ul>
  );
}

export default ConversationList;
