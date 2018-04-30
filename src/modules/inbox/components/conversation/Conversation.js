import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Message from './Message';
import AttachmentPreview from './AttachmentPreview';
import { TwitterConversation } from './TwitterConversation';

const propTypes = {
  conversation: PropTypes.object,
  conversationMessages: PropTypes.array.isRequired,
  attachmentPreview: PropTypes.object,
  scrollBottom: PropTypes.func.isRequired
};

const Wrapper = styled.div`
  padding: 20px;
  overflow: hidden;

  > div:first-child {
    margin-top: 0;
  }
`;

class Conversation extends Component {
  isStuff(conversation, firstMessage, currentMessage) {
    if (conversation.twitterData) {
      const firstTwitterData = firstMessage.customer.twitterData;
      const currentTwitterData = currentMessage.customer.twitterData;

      return firstTwitterData.id_str !== currentTwitterData.id_str;
    }

    return currentMessage.userId ? true : false;
  }

  renderMessages() {
    const { conversation, conversationMessages, scrollBottom } = this.props;

    if (!conversation) {
      return null;
    }

    let messagesList = conversationMessages || [];

    const messages = messagesList.slice();
    const firstMessage = messages.length && messages[0];
    const rows = [];

    let tempId;

    messages.forEach(message => {
      rows.push(
        <Message
          isSameUser={
            message.userId
              ? message.userId === tempId
              : message.customerId === tempId
          }
          message={message}
          staff={this.isStuff(conversation, firstMessage, message)}
          key={message._id}
          scrollBottom={scrollBottom}
        />
      );

      tempId = message.userId ? message.userId : message.customerId;
    });

    return rows;
  }

  renderConversation() {
    const { conversation, scrollBottom, conversationMessages } = this.props;
    const twitterData = conversation.twitterData;
    const isTweet = twitterData && !twitterData.isDirectMessage;

    if (isTweet) {
      return (
        <TwitterConversation
          conversation={conversation}
          scrollBottom={scrollBottom}
          conversationMessages={conversationMessages}
        />
      );
    }

    return this.renderMessages();
  }

  render() {
    const { attachmentPreview, scrollBottom } = this.props;

    return (
      <Wrapper>
        {this.renderConversation()}
        <AttachmentPreview
          scrollBottom={scrollBottom}
          attachmentPreview={attachmentPreview}
        />
      </Wrapper>
    );
  }
}

Conversation.propTypes = propTypes;

export default Conversation;
