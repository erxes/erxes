import * as React from "react";
import { __ } from "../../utils";
import { ConversationItem } from "../containers";
import { IConversation } from "../types";

type Props = {
  conversations: IConversation[];
  goToConversation: (conversationId: string) => void;
  createConversation: (e: React.FormEvent<HTMLButtonElement>) => void;
  loading: boolean;
  color: string;
};

function ConversationList(props: Props) {
  const {
    conversations,
    goToConversation,
    loading,
    createConversation,
    color
  } = props;

  if (loading) {
    return <div className="loader bigger" />;
  }

  if (conversations.length === 0) {
    return (
      <div className="empty-list">
        <p>{__("You didn't have any conversation yet")}</p>
        <button
          className="erxes-button"
          onClick={createConversation}
          style={{ backgroundColor: color, color }}
        >
          <span>{__("Start new conversation")}</span>
        </button>
      </div>
    );
  }

  return (
    <ul className="erxes-conversation-list">
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
