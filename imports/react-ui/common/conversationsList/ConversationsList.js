import React from 'react';
import PropTypes from 'prop-types';
import ListRow from './Row';
import SimpleRow from './SimpleRow';

const propTypes = {
  conversations: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  toggleBulk: PropTypes.func,
  channelId: PropTypes.string,
  simple: PropTypes.bool,
};

function Conversations({ conversations, user, toggleBulk, channelId, simple }) {
  const { starredConversationIds = [] } = user.details;

  return (
    <ul className="conversations-list">
      {conversations.map(
        c =>
          (simple
            ? <SimpleRow
                key={c._id}
                conversation={c}
                toggleBulk={toggleBulk}
                isRead={c.readUserIds && c.readUserIds.indexOf(user._id) > -1}
                channelId={channelId}
              />
            : <ListRow
                key={c._id}
                conversation={c}
                isRead={c.readUserIds && c.readUserIds.indexOf(user._id) > -1}
                starred={starredConversationIds.indexOf(c._id) !== -1}
                isParticipated={
                  !!c.participatedUserIds && c.participatedUserIds.indexOf(user._id) > -1
                }
                toggleBulk={toggleBulk}
                channelId={channelId}
              />),
      )}
    </ul>
  );
}

Conversations.propTypes = propTypes;

export default Conversations;
