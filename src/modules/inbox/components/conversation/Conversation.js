import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { Spinner } from 'modules/common/components';
import Message from './Message';

const propTypes = {
  conversation: PropTypes.object,
  attachmentPreview: PropTypes.object,
  scrollBottom: PropTypes.func.isRequired
};

const Wrapper = styled.div`
  padding: 20px;
  overflow: hidden;

  > div:first-child {
    margin-top: 0;
  }
`;

const Preview = styled.div`
  max-width: 360px;
  padding: 10px;
  background: ${colors.colorSecondary};
  margin-left: auto;
  margin-right: 55px;
  display: inline-block;
  float: right;
  box-shadow: 0 1px 1px 0 ${colors.darkShadow};
  border-radius: 7px;
  position: relative;

  > div {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -12px;
    margin-top: -12px;
  }

  img {
    max-width: 100%;
    opacity: 0.7;
  }
`;

const File = styled.span`
  width: 80px;
  height: 50px;
  display: block;
`;

class Conversation extends Component {
  constructor(props) {
    super(props);

    this.renderPreview = this.renderPreview.bind(this);
  }

  renderPreview() {
    const { attachmentPreview } = this.props;

    if (attachmentPreview && attachmentPreview.data) {
      return (
        <Preview>
          {attachmentPreview.type.startsWith('image') ? (
            <img alt={attachmentPreview.name} src={attachmentPreview.data} />
          ) : (
            <File />
          )}
          <Spinner />
        </Preview>
      );
    }

    return null;
  }

  render() {
    const { conversation, scrollBottom } = this.props;

    if (!conversation) {
      return null;
    }

    const messages = conversation.messages || [];
    const rows = [];

    let tempId;

    const childSelector = (fbData, parentId) => {
      return fbData && fbData.parentId && fbData.parentId === parentId;
    };

    const reactionCounts = reactions => {
      console.log(reactions);

      if (reactions) {
        const keys = Object.keys(reactions);
        const data = {};

        keys.forEach(key => {
          if (reactions[key]) data[key] = reactions[key].length;
        });

        console.log(data);
      }

      return null;
    };

    const renderMessages = (data, isFeed) => {
      data.forEach(message => {
        if (isFeed && message.facebookData) {
          console.log(message.facebookData.postUrl);
          reactionCounts(message.facebookData.reactions);
        }

        rows.push(
          <Message
            isSameUser={
              message.userId
                ? message.userId === tempId
                : message.customerId === tempId
            }
            message={message}
            staff={!message.customerId}
            key={message._id}
            scrollBottom={scrollBottom}
          />
        );

        tempId = message.userId ? message.userId : message.customerId;

        if (isFeed) {
          const childComments = messages.filter(msg => {
            return (
              message.facebookData &&
              childSelector(msg.facebookData, message.facebookData.commentId)
            );
          });

          renderMessages(childComments, false);
        }
      });
    };

    if (
      conversation.integration &&
      conversation.integration.kind === 'facebook' &&
      conversation.facebookData &&
      conversation.facebookData.kind === 'feed'
    ) {
      const post = messages.find(msg => {
        const fbData = msg.facebookData;
        return (
          (fbData.postId === conversation.postId && fbData.item === 'post') ||
          'status'
        );
      });

      if (post) {
        rows.push(
          <Message
            message={post}
            staff={!post.customerId}
            key={post._id}
            scrollBottom={scrollBottom}
          />
        );
      }

      const postComments = messages.filter(msg => {
        const fbData = msg.facebookData || {};
        return fbData.postId === fbData.parentId || msg.userId !== null;
      });

      renderMessages(postComments, true);
    } else {
      renderMessages(messages, false);
    }

    return (
      <Wrapper>
        {rows}
        {this.renderPreview()}
      </Wrapper>
    );
  }
}

Conversation.propTypes = propTypes;

export default Conversation;
