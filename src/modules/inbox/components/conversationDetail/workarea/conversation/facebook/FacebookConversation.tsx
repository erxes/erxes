import { FacebookComment } from 'modules/inbox/containers/conversationDetail';
import * as React from 'react';
import {
  IConversation,
  IMessage,
  IMessageFacebookData
} from '../../../../../types';
import { SimpleMessage } from '../messages';
import { FacebookPost } from './';
import { ShowMore } from './styles';

type Props = {
  conversation: IConversation;
  conversationMessages: IMessage[];
  scrollBottom: () => void;
  fetchFacebook: (
    {
      commentId,
      postId,
      limit
    }: { commentId?: string; postId?: string; limit?: number }
  ) => void;
};

const getAttr = (message: IMessage, attr: string) => {
  if (!message.facebookData) {
    return;
  }

  return message.facebookData[attr];
};

export default class FacebookConversation extends React.Component<
  Props,
  { limit: number }
> {
  constructor(props) {
    super(props);

    this.state = {
      limit: 2
    };
  }

  fetchComments = (facebookData?: IMessageFacebookData) => {
    if (!facebookData) {
      return;
    }

    const limit = this.state.limit + 5;

    this.setState({ limit }, () => {
      this.props.fetchFacebook({
        postId: facebookData.postId,
        limit: this.state.limit
      });
    });
  };

  renderReplies(comment: IMessage) {
    const { conversationMessages = [], fetchFacebook } = this.props;

    const replies = conversationMessages.filter(msg => {
      const parentId = getAttr(msg, 'parentId');

      return parentId && parentId === getAttr(comment, 'commentId');
    });

    return replies.map(reply => (
      <React.Fragment key={reply._id}>
        <FacebookComment message={reply} fetchFacebook={fetchFacebook} />
      </React.Fragment>
    ));
  }

  renderComments(comments: IMessage[]) {
    return comments.map(comment => (
      <React.Fragment key={comment._id}>
        <FacebookComment
          message={comment}
          fetchFacebook={this.props.fetchFacebook}
        />
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

  renderViewMore(post) {
    if (this.state.limit < post.facebookData.commentCount) {
      return (
        <ShowMore onClick={this.fetchComments.bind(this, post.facebookData)}>
          View previous comments
        </ShowMore>
      );
    }

    return null;
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
      } else if (!getAttr(message, 'isPost') && !getAttr(message, 'parentId')) {
        comments.push(message);
      }
    }

    return (
      <React.Fragment>
        <FacebookPost message={post} scrollBottom={scrollBottom} />
        {this.renderViewMore(post)}
        {this.renderComments(comments)}
        {this.renderInternals(internalMessages)}
      </React.Fragment>
    );
  }
}
