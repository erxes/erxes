import React, { PropTypes } from 'react';
import { ConversationList, Conversation, AccquireInformation } from '../containers';

const propTypes = {
  activeRoute: PropTypes.string.isRequired,
  color: PropTypes.string,
};

function Messenger({ activeRoute, color }) {
  switch (activeRoute) {
    case 'conversation':
      return <Conversation color={color} />;

    case 'conversationList':
      return <ConversationList color={color} />;

    // get user's contact information
    case 'accquireInformation':
      return <AccquireInformation color={color} />;

    default:
  }
}

Messenger.propTypes = propTypes;

export default Messenger;
