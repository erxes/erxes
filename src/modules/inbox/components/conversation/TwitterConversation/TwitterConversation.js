import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TwitterMessage } from './';
import Message from '../Message';

const propTypes = {
  conversation: PropTypes.object,
  scrollBottom: PropTypes.func.isRequired
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

  renderChildren(children) {
    if (children) {
      return <List>{this.renderTweets(children)}</List>;
    }
    return null;
  }

  renderTweets(messages) {
    return messages.map(message => {
      return (
        <li key={message._id}>
          <TwitterMessage
            message={message}
            scrollBottom={this.props.scrollBottom}
          />
          {this.renderChildren(message.children)}
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
    const { conversation } = this.props;

    if (!conversation) {
      return null;
    }

    const messages = conversation.messages || [];
    const nestedMessages = this.renderMessages(messages, null);

    return (
      <Fragment>
        <List isRoot>{this.renderTweets(nestedMessages)}</List>
        {this.renderInternals(messages)}
      </Fragment>
    );
  }
}

TwitterConversation.propTypes = propTypes;

export default TwitterConversation;
