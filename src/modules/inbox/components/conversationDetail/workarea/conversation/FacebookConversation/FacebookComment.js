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
import {
  ChildPost,
  User,
  Comment,
  Reply,
  ReplyReaction,
  FlexItem
} from './styles';

const propTypes = {
  message: PropTypes.object.isRequired,
  replyPost: PropTypes.func,
  scrollBottom: PropTypes.func
};

export default class FacebookComment extends Component {
  renderReactionCount(data) {
    if (data.likeCount === 0) {
      return null;
    }

    return (
      <ReplyReaction>
        {data.reactions && <Reactions reactions={data.reactions} comment />}
        <a>{data.likeCount}</a>
      </ReplyReaction>
    );
  }

  render() {
    const { message, replyPost, scrollBottom } = this.props;
    const data = message.facebookData || {};
    const size = data && data.parentId ? 20 : 32;

    return (
      <ChildPost isReply={data.parentId}>
        <NameCard.Avatar customer={message.customer || {}} size={size} />

        <User isReply={data.parentId}>
          <FlexItem>
            <Comment>
              <UserName username={data.senderName} userId={data.senderId} />
              <FacebookContent
                content={message.content}
                image={data.photo}
                link={data.link || data.video}
                scrollBottom={scrollBottom}
              />
            </Comment>
            {this.renderReactionCount(data)}
          </FlexItem>

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
        </User>
      </ChildPost>
    );
  }
}

FacebookComment.propTypes = propTypes;
