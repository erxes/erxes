import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { NameCard, Tip, ModalTrigger } from 'modules/common/components';
import { FacebookContent } from './';
import { ReplyingMessage } from 'modules/inbox/containers/conversationDetail';
import {
  PostContainer,
  ChildPost,
  User,
  Comment,
  Counts,
  Reaction,
  Reply,
  FlexItem,
  ReplyReaction
} from './styles';

const propTypes = {
  message: PropTypes.object.isRequired,
  likePost: PropTypes.func,
  currentConversationId: PropTypes.string,
  integrationId: PropTypes.string,
  scrollBottom: PropTypes.func.isRequired
};

class Message extends Component {
  renderLikePost(data) {
    const { likePost } = this.props;

    const post = {
      conversationMessageId: data.postId,
      type: 'SAD'
    };

    likePost(post);
  }

  renderUserName(username, userId) {
    return (
      <a target="_blank" href={`https://facebook.com/${username}-${userId}`}>
        {username}
      </a>
    );
  }

  renderDate() {
    const { message } = this.props;

    return (
      <Tip
        placement="bottom"
        text={moment(new Date(message.facebookData.createdAt) * 1000).format(
          'lll'
        )}
      >
        <span href={`https://facebook.com/statuses/`} target="_blank">
          {moment(new Date(message.facebookData.createdAt) * 1000).fromNow()}
        </span>
      </Tip>
    );
  }

  renderReactions(reactions) {
    return Object.keys(reactions).map(value => {
      const users = reactions[value].map((value, index) => (
        <div key={index}>{value.name}</div>
      ));

      if (reactions[value].length > 0) {
        return (
          <Tip key={value} text={users}>
            <Reaction className={value} />
          </Tip>
        );
      }

      return null;
    });
  }

  renderCounts(data) {
    return (
      <Counts>
        <FlexItem>
          {this.renderReactions(data.reactions)}
          <a>{data.likeCount}</a>
        </FlexItem>
        <span>{data.commentCount} Comments</span>
      </Counts>
    );
  }

  renderAttachments(data) {
    if (data.photo) {
      return <img src={data.photo} alt={data.postId} />;
    }

    return null;
  }

  render() {
    const { message, integrationId } = this.props;
    // console.log(message)
    const customer = message.customer || {};
    const data = message.facebookData || {};
    const size = data && data.parentId ? 20 : 32;

    if (data.isPost) {
      return (
        <PostContainer isReply={data.parentId} root>
          <NameCard.Avatar customer={customer} />

          <User isPost={data.isPost} root>
            {this.renderUserName(data.senderName, data.senderId)}
            {this.renderDate()}
          </User>
          <FacebookContent content={message.content} image={data.photo} />
          {this.renderCounts(data)}
        </PostContainer>
      );
    }

    return (
      <ChildPost isReply={data.parentId} root>
        <NameCard.Avatar customer={customer} size={size} />

        <User isPost={data.isPost} isReply={data.parentId}>
          <Comment>
            {this.renderUserName(data.senderName, data.senderId)}
            <FacebookContent content={message.content} isPost={data.isPost} />
            {this.renderAttachments(data)}
            {data.reactions && (
              <ReplyReaction>
                {this.renderReactions(data.reactions)}
                {data.likeCount}
              </ReplyReaction>
            )}
          </Comment>
          <div>
            <Reply>
              <a onClick={this.renderLikePost(data)}>Like</a> •
              <ModalTrigger title="Reply" trigger={<a>Reply •</a>}>
                <ReplyingMessage
                  commentId={data.commentId}
                  postId={data.postId}
                  integrationId={integrationId}
                  currentUserName={data.senderName}
                />
              </ModalTrigger>
            </Reply>
            {this.renderDate()}
          </div>
        </User>
      </ChildPost>
    );
  }
}

Message.propTypes = propTypes;

export default Message;
