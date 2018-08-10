import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FacebookComment } from 'modules/inbox/containers/conversationDetail';
import { FacebookPost } from './';

const propTypes = {
  conversation: PropTypes.object,
  scrollBottom: PropTypes.func.isRequired,
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

  renderComments(post) {
    const { conversationMessages = [] } = this.props;

    const comments = conversationMessages.filter(
      msg => !getAttr(msg, 'isPost') && !getAttr(msg, 'parentId')
    );

    return comments.map(comment => (
      <Fragment key={comment._id}>
        <FacebookComment message={comment} />

        {this.renderReplies(comment)}
      </Fragment>
    ));
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

    return (
      <Fragment>
        <FacebookPost message={post} />
        {this.renderComments(post)}
      </Fragment>
    );
  }
}

FacebookConversation.propTypes = propTypes;
