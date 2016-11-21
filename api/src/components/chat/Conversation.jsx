import React, { PropTypes } from 'react';
import moment from 'moment';
import { Chat } from '../../actions';


const propTypes = {
  dispatch: PropTypes.func.isRequired,
  conversation: PropTypes.object.isRequired,
  notifCount: PropTypes.number,
};

function Conversation({ dispatch, conversation, notifCount }) {
  function goToConversation() {
    const conversationId = conversation._id;

    // change current conversation
    dispatch(Chat.changeConversation(conversationId));

    // show message form
    dispatch(Chat.toMessageForm(true));

    // mark as read
    dispatch(Chat.readMessages(conversationId));
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
    <li className="erxes-conversation" onClick={goToConversation}>
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
