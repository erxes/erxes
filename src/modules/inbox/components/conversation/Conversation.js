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

  renderMessages() {
    const { conversation, scrollBottom } = this.props;
    const currentUser = this.context.currentUser;
    const twitterUsername =
      (currentUser &&
        currentUser.details &&
        currentUser.details.twitterUsername) ||
      '';

    if (!conversation) {
      return null;
    }

    const messages = conversation.messages || [];
    const rows = [];

    let tempId;

    messages.forEach(message => {
      const twitterData = message.customer && message.customer.twitterData;
      const isSameUser = message.userId
        ? message.userId === tempId
        : message.customerId === tempId;

      rows.push(
        <Message
          isSameUser={isSameUser}
          message={message}
          staff={
            !message.customerId ||
            (twitterData && twitterData.screenName === twitterUsername)
          }
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
    const isTweet =
      twitterData && !twitterData.isDirectMessage && twitterData.created_at;

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
Conversation.contextTypes = {
  currentUser: PropTypes.object
};

export default Conversation;
