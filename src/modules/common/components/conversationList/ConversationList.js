import React from 'react';
import PropTypes from 'prop-types';
import ListRow from './Row';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  toggleBulk: PropTypes.func,
  channelId: PropTypes.string
};

function ConversationList({ conversations, user, toggleBulk, channelId }) {
  const { starredConversationIds = [] } = user.details;

  return (
    <ul className="conversations-list">
      {conversations.map(c => (
        <ListRow
          key={c._id}
          conversation={c}
          isRead={c.readUserIds && c.readUserIds.indexOf(user._id) > -1}
          starred={starredConversationIds.indexOf(c._id) !== -1}
          isParticipated={
            !!c.participatedUserIds &&
            c.participatedUserIds.indexOf(user._id) > -1
          }
          toggleBulk={toggleBulk}
          channelId={channelId}
        />
      ))}
    </ul>
  );
}

ConversationList.propTypes = propTypes;

export default ConversationList;
