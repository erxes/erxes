import React, { PropTypes } from 'react';
import ListRow from './Row.jsx';


const propTypes = {
  conversations: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  toggleBulk: PropTypes.func,
  channelId: PropTypes.string,
};

function Conversations({ conversations, user, toggleBulk, channelId }) {
  const { starredConversationIds = [] } = user.details;

  return (
    <ul className="conversations-list">
      {
        conversations.map(c =>
          <ListRow
            key={c._id}
            conversation={c}
            isRead={c.readUserIds && c.readUserIds.indexOf(user._id) > -1}
            starred={starredConversationIds.indexOf(c._id) !== -1}
            isParticipate={!!c.participatedUserIds && c.participatedUserIds.indexOf(user._id) > -1}
            toggleBulk={toggleBulk}
            channelId={channelId}
          />,
        )
      }
    </ul>
  );
}

Conversations.propTypes = propTypes;

export default Conversations;
