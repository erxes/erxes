import { FacebookComment } from "modules/inbox/containers/conversationDetail";
import * as React from 'react';
import { IConversation, IMessage } from "../../../../../types";
import { SimpleMessage } from "../messages";
import { FacebookPost } from "./";

type Props = {
  conversation: IConversation;
  conversationMessages: IMessage[];
  scrollBottom: () => void;
};

const getAttr = (message: IMessage, attr: string) => {
  if (!message.facebookData) {
    return;
  }

  return message.facebookData[attr];
};

export default class FacebookConversation extends React.Component<Props, {}> {
  renderReplies(comment: IMessage) {
    const { conversationMessages = [] } = this.props;

    const replies = conversationMessages.filter(msg => {
      const parentId = getAttr(msg, "parentId");

      return parentId && parentId === getAttr(comment, "commentId");
    });

    return replies.map(reply => (
      <React.Fragment key={reply._id}>
        <FacebookComment message={reply} />
      </React.Fragment>
    ));
  }

  renderComments(comments: IMessage[]) {
    return comments.map(comment => (
      <React.Fragment key={comment._id}>
        <FacebookComment message={comment} />
        {this.renderReplies(comment)}
      </React.Fragment>
    ));
  }

  renderInternals(messages: IMessage[]) {
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

    const post = conversationMessages.find(message => {
      if (message.facebookData && message.facebookData.isPost) {
        return true;
      }

      return false;
    });

    if (!post) {
      return null;
    }

    const comments: IMessage[] = [];
    const internalMessages: IMessage[] = [];

    for (const message of conversationMessages) {
      if (message.internal) {
        internalMessages.push(message);
      } else if (!getAttr(message, "isPost") && !getAttr(message, "parentId")) {
        comments.push(message);
      }
    }

    return (
      <React.Fragment>
        <FacebookPost message={post} scrollBottom={scrollBottom} />
        {this.renderComments(comments)}
        {this.renderInternals(internalMessages)}
      </React.Fragment>
    );
  }
}
