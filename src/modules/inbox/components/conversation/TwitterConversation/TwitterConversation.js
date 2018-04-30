import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TwitterMessage } from 'modules/inbox/containers';
import Message from '../Message';

const propTypes = {
  conversation: PropTypes.object,
  scrollBottom: PropTypes.func.isRequired,
  conversationMessages: PropTypes.array
};

const List = styled.ul`
  list-style: none;
  padding-left: ${props => (props.isRoot ? '0' : '40px')};
  max-width: 700px;
`;

class TwitterConversation extends Component {
  constructor(props) {
    super(props);

    this.renderMessages = this.renderMessages.bind(this);
    this.renderTweets = this.renderTweets.bind(this);
  }

  renderMessages(messages, parent) {
    const array = [];

    messages.forEach(message => {
      if (
        message.twitterData &&
        message.twitterData.in_reply_to_status_id_str === parent
      ) {
        const children = this.renderMessages(
          messages,
          message.twitterData.id_str
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
      return <List>{this.renderTweets(children, integrationId)}</List>;
    }
    return null;
  }

  renderTweets(messages, integrationId) {
    return messages.map(message => {
      return (
        <li key={message._id}>
          <TwitterMessage
            message={message}
            currentConversationId={this.props.conversation._id}
            integrationId={integrationId}
            scrollBottom={this.props.scrollBottom}
          />
          {this.renderChildren(message.children, integrationId)}
        </li>
      );
    });
  }

  renderInternals(messages) {
    return messages.filter(message => !message.twitterData).map(message => {
      return (
        <Message
          message={message}
          staff={!message.customerId}
          key={message._id}
          scrollBottom={this.props.scrollBottom}
        />
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
    const nestedMessages = this.renderMessages(messages, null);

    return (
      <Fragment>
        <List isRoot>{this.renderTweets(nestedMessages, integrationId)}</List>
        {this.renderInternals(messages)}
      </Fragment>
    );
  }
}

TwitterConversation.propTypes = propTypes;

export default TwitterConversation;
