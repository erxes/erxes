import React, { PropTypes } from 'react';

const propTypes = {
  lastUnreadMessage: PropTypes.object,
  changeConversation: PropTypes.func,
};

function Notifier({ lastUnreadMessage, changeConversation }) {
  if (lastUnreadMessage) {
    return (
      <div onClick={() => changeConversation(lastUnreadMessage.conversationId)}>
        {lastUnreadMessage.content}
      </div>
    );
  }

  return null;
}

Notifier.propTypes = propTypes;

export default Notifier;
