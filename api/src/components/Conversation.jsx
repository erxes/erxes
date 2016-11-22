import React, { PropTypes } from 'react';
import moment from 'moment';


const propTypes = {
  conversation: PropTypes.object.isRequired,
  notifCount: PropTypes.number,
  goToConversation: PropTypes.func.isRequired,
};

function Conversation({ conversation, notifCount, goToConversation }) {
  function handleClick() {
    goToConversation(conversation._id);
  }

  function renderNewMessageCount() {
    if (notifCount > 0) {
      return (
        <div className="erxes-notif-count">
          {notifCount} new
        </div>
      );
    }

    return null;
  }

  return (
    <li className="erxes-conversation" onClick={handleClick}>
      <div className="erxes-c-content">
        <div className={notifCount > 0 ? 'erxes-message unread' : 'erxes-message'}>
          {conversation.content}
        </div>
        {renderNewMessageCount()}
      </div>
      <div className="erxes-c-info">
        {moment(conversation.createdAt).fromNow()}
      </div>
    </li>
  );
}

Conversation.propTypes = propTypes;

export default Conversation;
