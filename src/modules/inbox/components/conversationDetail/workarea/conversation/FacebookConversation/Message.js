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

class Message extends Component {
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

      const tooltip = <Tooltip id="tooltip">{users}</Tooltip>;

      if (reactions[value].length > 0) {
        return (
          <OverlayTrigger key={value} placement="top" overlay={tooltip}>
            <Reaction className={value} />
          </OverlayTrigger>
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
    const { message, replyPost } = this.props;
    // console.log(message);
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
              <ModalTrigger title="Reply" trigger={<a> Reply •</a>}>
                <ReplyingMessage
                  conversationId={message.conversationId}
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
}

Message.propTypes = propTypes;

export default Message;
