import React, { PropTypes } from 'react';
import { Conversation } from '../components';


const propTypes = {
  conversations: PropTypes.array.isRequired,
  notifications: PropTypes.object.isRequired,
  goToConversation: PropTypes.func.isRequired,
};

function ConversationList({ conversations, notifications, goToConversation }) {
  return (
    <ul className="erxes-conversation-list">
      {
        conversations.map(conversation =>
          <Conversation
            key={conversation._id}
            conversation={conversation}
            notificationCount={notifications[conversation._id]}
            goToConversation={goToConversation}
          />
        )
      }
    </ul>
  );
}

ConversationList.propTypes = propTypes;

export default ConversationList;
