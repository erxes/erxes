import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Message } from './';
// import { PostWrapper } from './styles';

const propTypes = {
  conversation: PropTypes.object,
  scrollBottom: PropTypes.func.isRequired,
  conversationMessages: PropTypes.array
};

class FacebookConversation extends Component {
  renderPosts(messages, integrationId) {
    return messages.map(message => {
      return (
        <Fragment key={message._id}>
          <Message
            message={message}
            totalConversationCount={messages.length}
            integrationId={integrationId}
            scrollBottom={this.props.scrollBottom}
          />
        </Fragment>
      );
    });
  }

  render() {
    const { conversation, conversationMessages } = this.props;
    const integration = conversation.integration;
    const integrationId = integration && conversation.integration._id;

    if (!conversation) {
      return null;
    }

    const messages = conversationMessages || [];

    return <Fragment>{this.renderPosts(messages, integrationId)}</Fragment>;
  }
}

FacebookConversation.propTypes = propTypes;

export default FacebookConversation;
