import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextDivider } from 'modules/common/components';
import Message from './Message';

const propTypes = {
  messages: PropTypes.array.isRequired,
  attachmentPreview: PropTypes.object
};

const Wrapper = styled.div`
  padding: 20px;

  > div:first-child {
    margin-top: 0;
  }
`;

class Conversation extends Component {
  render() {
    const { messages } = this.props;
    let tempId;

    const rows = [];

    messages.forEach(message => {
      if (message.info) {
        rows.push(<TextDivider key={message._id} text={message.content} />);
      } else {
        rows.push(
          <Message
            isSameUser={
              message.userId
                ? message.userId === tempId
                : message.customerId === tempId
            }
            message={message}
            staff={!message.customerId}
            key={message._id}
          />
        );

        tempId = message.userId ? message.userId : message.customerId;
      }
    });

    return <Wrapper>{rows}</Wrapper>;
  }
}

Conversation.propTypes = propTypes;

export default Conversation;
