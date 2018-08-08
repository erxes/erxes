import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FacebookMessage } from 'modules/inbox/containers/conversationDetail';

const propTypes = {
  conversation: PropTypes.object,
  scrollBottom: PropTypes.func.isRequired,
  conversationMessages: PropTypes.array
};

class FacebookConversation extends Component {
  renderMessages(messages, parent) {
    const array = [];

    messages.forEach(message => {
      if (message.facebookData && message.facebookData.parentId === parent) {
        const children = this.renderMessages(
          messages,
          message.facebookData.commentId || message.facebookData.postId
        );

        let child = message;

        if (children.length) {
          child = Object.assign({ children }, message);
        }

        array.push(child);
      }
    });
    return array;
  }

  renderChildren(children, integrationId) {
    if (children) {
      return this.renderPosts(children, integrationId);
    }
    return null;
  }

  renderPosts(messages, integrationId) {
    return messages.map(message => (
      <Fragment key={message._id}>
        <FacebookMessage
          message={message}
          totalConversationCount={messages.length}
        />
        {this.renderChildren(message.children, integrationId)}
      </Fragment>
    ));
  }

  render() {
    const { conversation, conversationMessages } = this.props;
    const integration = conversation.integration;
    const integrationId = integration && conversation.integration._id;

    if (!conversation) {
      return null;
    }

    const messages = conversationMessages || [];
    const nestedMessages = this.renderMessages(messages, null);

    return (
      <Fragment>{this.renderPosts(nestedMessages, integrationId)}</Fragment>
    );
  }
}

FacebookConversation.propTypes = propTypes;

export default FacebookConversation;
