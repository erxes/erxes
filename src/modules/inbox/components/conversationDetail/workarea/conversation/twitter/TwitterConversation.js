import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TwitterMessage } from 'modules/inbox/containers/conversationDetail';
import { SimpleMessage } from '../messages';

const propTypes = {
  conversation: PropTypes.object,
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

    this.formatMessages = this.formatMessages.bind(this);
    this.renderTweets = this.renderTweets.bind(this);
  }

  formatMessages(messages, parent) {
    const array = [];

    messages.forEach(msg => {
      if (!msg.twitterData) {
        return null;
      }

      if (msg.twitterData.in_reply_to_status_id_str === parent) {
        const children = this.formatMessages(messages, msg.twitterData.id_str);

        let child = msg;

        if (children.length) {
          child = Object.assign({ children }, msg);
        }

        array.push(child);
      }
    });

    return array;
  }

  renderChildren(children, integrationId) {
    if (!children) {
      return null;
    }

    return <List>{this.renderTweets(children, integrationId)}</List>;
  }

  renderTweets(messages, integrationId) {
    return messages.map(message => {
      return (
        <li key={message._id}>
          <TwitterMessage
            message={message}
            currentConversationId={this.props.conversation._id}
            integrationId={integrationId}
          />
          {this.renderChildren(message.children, integrationId)}
        </li>
      );
    });
  }

  renderInternals(messages) {
    return messages.filter(message => !message.twitterData).map(message => {
      return (
        <SimpleMessage
          message={message}
          isStaff={!message.customerId}
          key={message._id}
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
    const nestedMessages = this.formatMessages(messages, null);

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
