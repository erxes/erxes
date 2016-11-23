import React, { PropTypes } from 'react';
import moment from 'moment';
import classNames from 'classnames';


const propTypes = {
  conversation: PropTypes.object.isRequired,
  notifCount: PropTypes.number,
  goToConversation: PropTypes.func.isRequired,
};

function Conversation({ conversation, notifCount, goToConversation }) {
  const { _id, content, createdAt } = conversation;

  return (
    <li
      className="erxes-conversation"
      onClick={() => { goToConversation(_id); }}
    >
      <div className={classNames('erxes-message', { unread: notifCount > 0 })}>
        {content}
      </div>
      <div className="date">
        {moment(createdAt).fromNow()}
      </div>
      <div className="new-message-count">
        {notifCount > 0 ? `${notifCount} new messages` : ''}
      </div>
    </li>
  );
}

Conversation.propTypes = propTypes;

export default Conversation;
