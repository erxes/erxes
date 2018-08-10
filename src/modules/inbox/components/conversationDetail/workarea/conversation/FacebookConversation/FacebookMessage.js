import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { NameCard, Tip, ModalTrigger } from 'modules/common/components';
import { FacebookContent, ReplyingMessage } from './';
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
  replyPost: PropTypes.func
};

class FacebookMessage extends Component {
  renderUserName(username, userId) {
    return (
      <a target="_blank" href={`https://facebook.com/${username}-${userId}`}>
        {username}
      </a>
    );
  }

  renderDate() {
    const { message } = this.props;
    const data = message.facebookData;

    return (
      <Tip
        placement="bottom"
        text={data && moment(message.createdAt).format('lll')}
      >
        <span href={`https://facebook.com/statuses/`} target="_blank">
          {moment(message.createdAt).fromNow()}
        </span>
      </Tip>
    );
  }

  renderReactions(reactions) {
    return Object.keys(reactions).map(value => {
      const users = reactions[value].map((value, index) => (
        <div key={index}>{value.name}</div>
      ));

      const tooltip = <Tooltip id="tooltip">{users}</Tooltip>;

      if (!reactions[value].length > 0) {
        return null;
      }

      return (
        <OverlayTrigger key={value} placement="top" overlay={tooltip}>
          <Reaction className={value} />
        </OverlayTrigger>
      );
    });
  }

  renderReactionCount(data) {
    if (data.likeCount === 0) {
      return null;
    }

    return (
      <ReplyReaction>
        {data.reactions && this.renderReactions(data.reactions)}
        {data.likeCount}
      </ReplyReaction>
    );
  }

  renderCounts(data) {
    return (
      <Counts>
        <FlexItem>
          {data.reactions && this.renderReactions(data.reactions)}
          <a>{data.likeCount}</a>
        </FlexItem>
        <span>{data.commentCount} Comments</span>
      </Counts>
    );
  }

  renderAttachments(data) {
    if (!data.photo) {
      return null;
    }

    return <img src={data.photo} alt={data.postId} />;
  }

  renderChildComments(data, message) {
    const { replyPost } = this.props;
    const size = data && data.parentId ? 20 : 32;

    return (
      <ChildPost isReply={data.parentId} root>
        <NameCard.Avatar customer={message.customer || {}} size={size} />

        <User isPost={data.isPost} isReply={data.parentId}>
          <Comment>
            {this.renderUserName(data.senderName, data.senderId)}
            <FacebookContent content={message.content} isPost={data.isPost} />
            {this.renderAttachments(data)}
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
            {this.renderDate()}
          </div>
        </User>
      </ChildPost>
    );
  }

  render() {
    const { message } = this.props;
    const customer = message.customer || {};
    const data = message.facebookData || {};

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

    return this.renderChildComments(data, message);
  }
}

FacebookMessage.propTypes = propTypes;

export default FacebookMessage;
