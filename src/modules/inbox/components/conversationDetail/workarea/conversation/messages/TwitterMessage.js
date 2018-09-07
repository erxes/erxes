import * as React from 'react';
import PropTypes from 'prop-types';
import { SimpleMessage } from './';

const propTypes = {
  message: PropTypes.object.isRequired,
  conversationFirstMessage: PropTypes.object.isRequired
};

const TwitterMessage = props => {
  const { conversationFirstMessage, message } = props;

  const firstTwitterData = conversationFirstMessage.customer.twitterData;
  const currentTwitterData = message.customer.twitterData;

  return (
    <SimpleMessage
      {...props}
      isStaff={firstTwitterData.id_str !== currentTwitterData.id_str || false}
    />
  );
};

TwitterMessage.propTypes = propTypes;

export default TwitterMessage;
