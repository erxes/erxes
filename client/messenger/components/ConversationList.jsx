import React, { PropTypes } from 'react';
import TopBar from './TopBar';
import { ConversationItem } from '../containers';


const propTypes = {
  conversations: PropTypes.array.isRequired,
  createConversation: PropTypes.func.isRequired,
  goToConversation: PropTypes.func.isRequired,
  data: PropTypes.object,
};

function ConversationList({ conversations, createConversation, goToConversation, data }) {
  const title = (
    <div className="erxes-topbar-title">
      <div>Conversations</div>
      <span>with Support staffs</span>
    </div>
  );

  const color = data.uiOptions && data.uiOptions.color;

  return (
    <div className="erxes-messenger">
      <TopBar
        middle={title}
        buttonClass="new"
        color={color}
        onButtonClick={createConversation}
      />
      <ul className="erxes-conversation-list">
        {
          conversations.map(conversation =>
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              goToConversation={goToConversation}
            />,
          )
        }
      </ul>
    </div>
  );
}

ConversationList.propTypes = propTypes;

export default ConversationList;
