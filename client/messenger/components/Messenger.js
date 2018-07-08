import React from 'react';
import PropTypes from 'prop-types';
import {
  ConversationList,
  ConversationCreate,
  ConversationDetail,
  AccquireInformation,
} from '../containers';

const propTypes = {
  activeRoute: PropTypes.string.isRequired,
  color: PropTypes.string,
};

function Messenger({ activeRoute, color }) {
  switch (activeRoute) {
    case 'conversationDetail':
      return <ConversationDetail color={color} />;

    case 'conversationCreate':
      return <ConversationCreate isNew color={color} />;

    case 'conversationList':
      return <ConversationList />;

    // get user's contact information
    case 'accquireInformation':
      return <AccquireInformation color={color} />;

    default:
  }
}

Messenger.propTypes = propTypes;

export default Messenger;
