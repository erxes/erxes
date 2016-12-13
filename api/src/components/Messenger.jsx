import React, { PropTypes } from 'react';
import { ConversationList, Conversation } from '../containers';


const propTypes = {
  activeRoute: PropTypes.string.isRequired,
};

function Messenger({ activeRoute }) {
  switch (activeRoute) {
    case 'conversation':
      return <Conversation />;
    default:
    case 'conversationList':
      return <ConversationList />;
  }
}

Messenger.propTypes = propTypes;

export default Messenger;
