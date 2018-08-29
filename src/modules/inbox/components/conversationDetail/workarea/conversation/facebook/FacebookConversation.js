import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FacebookComment } from 'modules/inbox/containers/conversationDetail';
import { SimpleMessage } from '../messages';
import { FacebookPost } from './';

const propTypes = {
  conversation: PropTypes.object,
  conversationMessages: PropTypes.array
};

const getAttr = (message, attr) => {
  if (!message.facebookData) {
    return;
  }

  return message.facebookData[attr];
};

export default class FacebookConversation extends Component {
  renderReplies(comment) {
    const { conversationMessages = [] } = this.props;

    const replies = conversationMessages.filter(msg => {
      const parentId = getAttr(msg, 'parentId');

      return parentId && parentId === getAttr(comment, 'commentId');
    });

    return replies.map(reply => (
      <Fragment key={reply._id}>
        <FacebookComment message={reply} />
      </Fragment>
    ));
  }

  renderComments(post, comments) {
    return comments.map(comment => (
      <Fragment key={comment._id}>
        <FacebookComment message={comment} />
        {this.renderReplies(comment)}
      </Fragment>
    ));
  }

  renderInternals(messages) {
    return messages.map(message => {
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
    const { conversation, conversationMessages = [] } = this.props;

    if (!conversation) {
      return null;
    }

    const post = conversationMessages.find(
      message => message.facebookData.isPost
    );

    if (!post) {
      return null;
    }

    const comments = [];
    const internalMessages = [];

    for (const message of conversationMessages) {
      if (message.internal) {
        internalMessages.push(message);
      } else if (!getAttr(message, 'isPost') && !getAttr(message, 'parentId')) {
        comments.push(message);
      }
    }

    return (
      <Fragment>
        <FacebookPost message={post} />
        {this.renderComments(post, comments)}
        {this.renderInternals(internalMessages)}
      </Fragment>
    );
  }
}

FacebookConversation.propTypes = propTypes;
