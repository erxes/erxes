import { FacebookComment } from "modules/inbox/containers/conversationDetail";
import React, { Component, Fragment } from "react";
import { IConversation, IMessageDocument } from "../../../../../types";
import { SimpleMessage } from "../messages";
import { FacebookPost } from "./";

type Props = {
  conversation: IConversation;
  conversationMessages: IMessageDocument[];
  scrollBottom: () => void;
};

const getAttr = (message, attr) => {
  if (!message.facebookData) {
    return;
  }

  return message.facebookData[attr];
};

export default class FacebookConversation extends Component<Props, {}> {
  renderReplies(comment) {
    const { conversationMessages = [] } = this.props;

    const replies = conversationMessages.filter(msg => {
      const parentId = getAttr(msg, "parentId");

      return parentId && parentId === getAttr(comment, "commentId");
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
    const {
      conversation,
      conversationMessages = [],
      scrollBottom
    } = this.props;

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
      } else if (!getAttr(message, "isPost") && !getAttr(message, "parentId")) {
        comments.push(message);
      }
    }

    return (
      <Fragment>
        <FacebookPost message={post} scrollBottom={scrollBottom} />
        {this.renderComments(post, comments)}
        {this.renderInternals(internalMessages)}
      </Fragment>
    );
  }
}
