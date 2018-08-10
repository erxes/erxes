import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NameCard, ModalTrigger } from 'modules/common/components';
import {
  FacebookContent,
  Reactions,
  Date,
  UserName,
  ReplyingMessage
} from './';
import { ChildPost, User, Comment, Reply, ReplyReaction } from './styles';

const propTypes = {
  message: PropTypes.object.isRequired,
  replyPost: PropTypes.func
};

export default class FacebookComment extends Component {
  renderReactionCount(data) {
    if (data.likeCount === 0) {
      return null;
    }

    return (
      <ReplyReaction>
        {data.reactions && <Reactions reactions={data.reactions} />}
        {data.likeCount}
      </ReplyReaction>
    );
  }

  renderAttachment(data) {
    if (!data.photo) {
      return null;
    }

    return <img src={data.photo} alt={data.postId} />;
  }

  render() {
    const { message, replyPost } = this.props;
    const data = message.facebookData || {};
    const size = data && data.parentId ? 20 : 32;

    return (
      <ChildPost isReply={data.parentId}>
        <NameCard.Avatar customer={message.customer || {}} size={size} />

        <User>
          <Comment>
            <UserName username={data.senderName} userId={data.senderId} />
            <FacebookContent content={message.content} isPost={data.isPost} />
            {this.renderAttachment(data)}
            {this.renderReactionCount(data)}
          </Comment>
          <div>
            <Reply>
              <ModalTrigger title="Reply" trigger={<a> Reply •</a>}>
                <ReplyingMessage
                  conversationId={message.conversationId}
                  commentId={data.commentId}
                  currentUserName={data.senderName}
                  replyPost={replyPost}
                />
              </ModalTrigger>
            </Reply>
            <Date message={message} />
          </div>
        </User>
      </ChildPost>
    );
  }
}

FacebookComment.propTypes = propTypes;
