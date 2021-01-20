import * as React from "react";
import { iconPlus } from "../../icons/Icons";
import { __ } from "../../utils";
import { ConversationItem } from "../containers";
import { IConversation } from "../types";

type Props = {
  conversations: IConversation[];
  goToConversation: (conversationId: string) => void;
  createConversation: (e: React.FormEvent<HTMLLIElement>) => void;
  loading: boolean;
};

function ConversationList(props: Props) {
  const {
    conversations,
    goToConversation,
    loading,
    createConversation
  } = props;

  if (loading) {
    return <div className="loader" />;
  }

  const createButton = () => {
    return (
      <li onClick={createConversation} className="erxes-list-item">
        <div className="erxes-left-side">
          <span>{iconPlus}</span>
        </div>
        <div className="erxes-right-side">
          <div className="erxes-name">{__("Start new conversation")}</div>
          <div className="erxes-last-message">
            {__("Talk with support staff")}
          </div>
        </div>
      </li>
    );
  };

  return (
    <ul className="erxes-conversation-list">
      {createButton()}
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
