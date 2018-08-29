import React from 'react';
import PropTypes from 'prop-types';

import { FormMessage, SimpleMessage, FacebookMessage, AppMessage } from './';

const propTypes = {
  message: PropTypes.object.isRequired,
  isSameUser: PropTypes.bool
};

function Message({ message, isSameUser }) {
  if (message.formWidgetData) {
    return <FormMessage message={message} />;
  }

  if (message.facebookData) {
    return <FacebookMessage message={message} />;
  }

  if (message.messengerAppData) {
    return <AppMessage message={message} />;
  }

  return (
    <SimpleMessage
      message={message}
      isStaff={message.userId ? true : false}
      isSameUser={isSameUser}
    />
  );
}

Message.propTypes = propTypes;

export default Message;
