import React, { PropTypes } from 'react';
import { ConversationList, Conversation } from '../containers';


const propTypes = {
  activeRoute: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

function Messenger({ activeRoute, color }) {
  switch (activeRoute) {
    case 'conversation':
      return <Conversation color={color} />;
    default:
    case 'conversationList':
      return <ConversationList color={color} />;
  }
}

Messenger.propTypes = propTypes;

export default Messenger;
