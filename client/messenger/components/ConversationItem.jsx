import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import striptags from 'striptags';
import classNames from 'classnames';

const propTypes = {
  conversation: PropTypes.object.isRequired,
  notificationCount: PropTypes.number,
  goToConversation: PropTypes.func.isRequired,
};

const contextTypes = {
  __: PropTypes.func,
};

function ConversationItem(
  { conversation, notificationCount, goToConversation },
  { __ },
) {
  const { _id, content, createdAt } = conversation;
  const participatedUser = conversation.participatedUsers[0];
  const avatar =
    (participatedUser && participatedUser.details.avatar) ||
    '/static/images/default-avatar.svg';
  const fullName =
    (participatedUser && participatedUser.details.fullName) ||
    __('Support staff');

  return (
    <li
      className={classNames('erxes-conversation-item', {
        unread: notificationCount > 0,
      })}
      onClick={() => {
        goToConversation(_id);
      }}>
      <img className="erxes-list-avatar" src={avatar} alt={fullName} />
      <div className="erxes-right-side">
        <div className="erxes-date">
          {moment(createdAt).format('YYYY-MM-DD, HH:mm:ss')}
        </div>
        <div className="erxes-name">{fullName}</div>
        <div className="erxes-last-message">{striptags(content)}</div>
      </div>
    </li>
  );
}

ConversationItem.propTypes = propTypes;
ConversationItem.contextTypes = contextTypes;

ConversationItem.defaultProps = {
  notificationCount: 0,
};

export default ConversationItem;
