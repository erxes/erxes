import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as moment from 'moment';
import * as striptags from 'striptags';
import * as classNames from 'classnames';
import { defaultAvatar } from '../../icons/Icons';

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
    (participatedUser && participatedUser.details.avatar) || defaultAvatar;
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
        <div className="erxes-date erxes-tooltip" data-tooltip={moment(createdAt).format('YYYY-MM-DD, HH:mm:ss')}>
          {moment(createdAt).format('LT')}
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
