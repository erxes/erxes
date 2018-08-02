import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { NameCard, Tip } from 'modules/common/components';
import {
  PostContainer,
  ChildPost,
  User,
  Comment,
  Counts,
  Reaction,
  Reply
} from './styles';

const propTypes = {
  message: PropTypes.object.isRequired,
  currentConversationId: PropTypes.string,
  integrationId: PropTypes.string,
  scrollBottom: PropTypes.func.isRequired
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

  renderReactionIcons(key, value) {
    const message = (
      <Fragment>
        <b style={{ display: 'block' }}>{key}</b>
        {value.map(user => user.name)}
      </Fragment>
    );

    return (
      <Tip text={message}>
        <Reaction className={key} />
      </Tip>
    );
  }

  renderReactions(reactions) {
    return Object.keys(reactions).map(value => {
      if (value.length > 0) {
        return reactions[value].map(reaction =>
          this.renderReactionIcons(value, reactions[value])
        );
      }

      return null;
    });
  }

  renderCounts(data) {
    return (
      <Counts>
        <div key={data.postId}>
          {this.renderReactions(data.reactions)}
          <a>{data.likeCount}</a>
        </div>
        <span>{data.commentCount} Comments</span>
      </Counts>
    );
  }

  render() {
    const { message } = this.props;
    // console.log(message)
    const customer = message.customer || {};
    const data = message.facebookData || {};
    const size = data && data.parentId ? 20 : 32;

    if (!data.isPost) {
      return (
        <ChildPost isReply={data.parentId} root>
          <NameCard.Avatar customer={customer} size={size} />

          <User isPost={data.isPost} isReply={data.parentId}>
            <Comment>
              {this.renderUserName(data.senderName, data.senderId)}
              <p>{message.content}</p>
            </Comment>
            <div>
              <Reply>
                <a>Like</a> • <a>Reply</a> •
              </Reply>
              {this.renderDate()}
            </div>
          </User>
        </ChildPost>
      );
    }

    return (
      <PostContainer isReply={data.parentId} root>
        <NameCard.Avatar customer={customer} />

        <User isPost={data.isPost} root>
          {this.renderUserName(data.senderName, data.senderId)}
          {this.renderDate()}
        </User>
        <p>{message.content}</p>
        {this.renderCounts(data)}
      </PostContainer>
    );
  }
}

Message.propTypes = propTypes;

export default Message;
