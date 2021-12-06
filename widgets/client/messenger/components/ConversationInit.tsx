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
  goToAllConversations: (e: React.FormEvent<HTMLLIElement>) => void;
  responseRate?: string;
};

function ConversationInit(props: Props) {
  const {
    conversations,
    goToConversation,
    loading,
    createConversation,
    goToAllConversations,
    responseRate
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
        <div className="erxes-right-plus">
          <div className="erxes-name">{__("Start new conversation")}</div>
          <div className="erxes-last-message">
            {__("Our usual response time")}<br /> 
            <strong>{responseRate}</strong>
          </div>
        </div>
      </li>
    );
  };

  const seeAllConversationBtn = () => {
    return (
      <li onClick={goToAllConversations} className="erxes-list-item">
        <div className="erxes-right-side">
          <div className="erxes-last-message">
            {__("See all your conversations")}
          </div>
        </div>
      </li>
    )
  }

  return (
    <>
      <ul className="erxes-conversation-init">
        {conversations.length > 0 &&
          <ConversationItem
            key={conversations[0]._id}
            conversation={conversations[0]}
            goToConversation={goToConversation}
          />}
        {conversations.length > 1 && seeAllConversationBtn()}
        {createButton()}
      </ul>
    </>
  );
}

export default ConversationInit;
