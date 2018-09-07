import * as React from 'react';
import PropTypes from 'prop-types';
import {
  FormMessage,
  SimpleMessage,
  FacebookMessage,
  AppMessage,
  TwitterMessage
} from './';

const propTypes = {
  message: PropTypes.object.isRequired,
  isSameUser: PropTypes.bool
};

function Message(props) {
  const { message, isSameUser } = props;

  if (message.formWidgetData) {
    return <FormMessage {...props} />;
  }

  if (message.facebookData) {
    return <FacebookMessage {...props} />;
  }

  if (message.twitterData) {
    return <TwitterMessage {...props} />;
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
