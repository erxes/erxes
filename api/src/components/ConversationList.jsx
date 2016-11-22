import React, { PropTypes } from 'react';
import Conversation from '../components/Conversation.jsx';


const propTypes = {
  conversations: PropTypes.array.isRequired,
  notifs: PropTypes.object.isRequired,
  goToConversation: PropTypes.func.isRequired,
};

function ConversationList({ conversations, notifs, goToConversation }) {
  return (
    <div className="erxes-content-container no-space">
      <ul className="erxes-conversations">
        {
          conversations.map(conversation =>
            <Conversation
              key={conversation._id}
              conversation={conversation}
              notifCount={notifs[conversation._id]}
              goToConversation={goToConversation}
            />
          )
        }
      </ul>
    </div>
  );
}

ConversationList.propTypes = propTypes;

export default ConversationList;
