import React from 'react';
import PropTypes from 'prop-types';
import ListRow from './Row';
import { ConversationItems } from './styles';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  toggleBulk: PropTypes.func,
  onRowClick: PropTypes.func,
  channelId: PropTypes.string
};

function ConversationList(
  { conversations, toggleBulk, onRowClick, channelId },
  { currentUser }
) {
  const starredConversationIds = currentUser
    ? currentUser.details.starredConversationIds || []
    : [];

  return (
    <ConversationItems>
      {conversations.map(c => (
        <ListRow
          key={c._id}
          conversation={c}
          isRead={c.readUserIds && c.readUserIds.indexOf(currentUser._id) > -1}
          starred={starredConversationIds.indexOf(c._id) !== -1}
          isParticipated={
            !!c.participatedUserIds &&
            c.participatedUserIds.indexOf(currentUser._id) > -1
          }
          toggleBulk={toggleBulk}
          onClick={onRowClick}
          channelId={channelId}
        />
      ))}
    </ConversationItems>
  );
}

ConversationList.propTypes = propTypes;

ConversationList.contextTypes = {
  currentUser: PropTypes.object
};

export default ConversationList;
