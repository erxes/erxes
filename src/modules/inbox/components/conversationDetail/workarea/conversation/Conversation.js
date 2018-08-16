import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Message from './Message';
import AttachmentPreview from './AttachmentPreview';
import { TwitterConversation } from './TwitterConversation';
import { FacebookConversation } from './FacebookConversation';
import { Spinner } from 'modules/common/components';

const propTypes = {
  conversation: PropTypes.object,
  conversationMessages: PropTypes.array.isRequired,
  attachmentPreview: PropTypes.object,
  scrollBottom: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

const Wrapper = styled.div`
  padding: 20px;
  overflow: hidden;
  min-height: 80px;

  > div:first-child {
    margin-top: 0;
  }
`;

class Conversation extends Component {
  isStuff(conversation, firstMessage, currentMessage) {
    if (conversation.twitterData && firstMessage.twitterData) {
      const firstTwitterData = firstMessage.customer.twitterData;
      const currentTwitterData = currentMessage.customer.twitterData;

      return firstTwitterData.id_str !== currentTwitterData.id_str || false;
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
    const {
      loading,
      conversation,
      scrollBottom,
      conversationMessages
    } = this.props;

    if (loading) {
      return <Spinner objective />;
    }

    const twitterData = conversation.twitterData;
    const facebookData = conversation.facebookData;
    const isTweet = twitterData && !twitterData.isDirectMessage;
    const isFacebookPost = facebookData && facebookData.kind !== 'messenger';

    if (isTweet) {
      return (
        <TwitterConversation
          conversation={conversation}
          scrollBottom={scrollBottom}
          conversationMessages={conversationMessages}
        />
      );
    }

    if (isFacebookPost) {
      return (
        <FacebookConversation
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
