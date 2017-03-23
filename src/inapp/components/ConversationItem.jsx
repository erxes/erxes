import React, { PropTypes } from 'react';
import moment from 'moment';
import classNames from 'classnames';


const propTypes = {
  conversation: PropTypes.object.isRequired,
  notificationCount: PropTypes.number,
  goToConversation: PropTypes.func.isRequired,
};

function ConversationItem({ conversation, notificationCount, goToConversation }) {
  const { _id, content, createdAt } = conversation;

  return (
    <li
      className={classNames('erxes-conversation-item', { unread: notificationCount > 0 })}
      onClick={() => { goToConversation(_id); }}
    >
      <img className="erxes-list-avatar" src="https://crm.nmma.co/assets/images/userDefaultIcon.png" alt="" />
      <div className="erxes-right-side">
        <div className="erxes-date">
          {moment(createdAt).fromNow()}
        </div>
        <div className="erxes-name">Support staff</div>
        <div className="erxes-last-message">
          {content}
        </div>
      </div>
    </li>
  );
}

ConversationItem.propTypes = propTypes;

export default ConversationItem;
