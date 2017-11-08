import React from 'react';
import PropTypes from 'prop-types';
import ListRow from './Row';
import { ConversationItems } from './styles';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  user: PropTypes.object,
  toggleBulk: PropTypes.func,
  channelId: PropTypes.string
};

function ConversationList({ conversations, user, toggleBulk, channelId }) {
  const starredConversationIds = user
    ? user.details.starredConversationIds || []
    : [];

  return (
    <ConversationItems>
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
    </ConversationItems>
  );
}

ConversationList.propTypes = propTypes;

export default ConversationList;
