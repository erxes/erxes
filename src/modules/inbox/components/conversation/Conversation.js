import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { Spinner } from 'modules/common/components';
import Message from './Message';
import { TwitterConversation } from './TwitterConversation';

const propTypes = {
  conversation: PropTypes.object,
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

const Preview = styled.div`
  max-width: 360px;
  padding: 10px;
  background: ${colors.colorSecondary};
  margin-left: auto;
  margin-right: 55px;
  display: inline-block;
  float: right;
  box-shadow: 0 1px 1px 0 ${colors.darkShadow};
  border-radius: 7px;
  position: relative;

  > div {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -12px;
    margin-top: -12px;
  }

  img {
    max-width: 100%;
    opacity: 0.7;
  }
`;

const File = styled.span`
  width: 80px;
  height: 50px;
  display: block;
`;

class Conversation extends Component {
  renderPreview() {
    const { attachmentPreview } = this.props;

    if (attachmentPreview && attachmentPreview.data) {
      return (
        <Preview>
          {attachmentPreview.type.startsWith('image') ? (
            <img alt={attachmentPreview.name} src={attachmentPreview.data} />
          ) : (
            <File />
          )}
          <Spinner />
        </Preview>
      );
    }

    return null;
  }

  isStuff(conversation, firstMessage, currentMessage) {
    if (conversation.twitterData) {
      const firstTwitterData = firstMessage.customer.twitterData;
      const currentTwitterData = currentMessage.customer.twitterData;

      return firstTwitterData.id_str !== currentTwitterData.id_str;
    }

    return currentMessage.userId;
  }

  renderMessages() {
    const { conversation, scrollBottom } = this.props;

    if (!conversation) {
      return null;
    }

    const messages = conversation.messages || [];
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
    const { conversation, scrollBottom } = this.props;
    const twitterData = conversation.twitterData;
    const isTweet = twitterData && !twitterData.isDirectMessage;

    if (isTweet) {
      return (
        <TwitterConversation
          conversation={conversation}
          scrollBottom={scrollBottom}
        />
      );
    }

    return this.renderMessages();
  }

  render() {
    return (
      <Wrapper>
        {this.renderConversation()}
        {this.renderPreview()}
      </Wrapper>
    );
  }
}

Conversation.propTypes = propTypes;

export default Conversation;
