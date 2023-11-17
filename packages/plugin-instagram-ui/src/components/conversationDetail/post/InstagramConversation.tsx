import * as React from 'react';

import { IMessage } from '@erxes/ui-inbox/src/inbox/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import SimpleMessage from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/messages/SimpleMessage';

import InstagramPost from './InstagramPost';
import { ShowMore } from './styles';
import { IInstagramComment, IInstagramPost } from '../../../types';
import InstagramComment from '../../../containers/post/InstagramComment';

type Props = {
  commentCount: number;
  post?: IInstagramPost;
  customer: ICustomer;
  comments: IInstagramComment[];
  internalNotes: IMessage[];
  hasMore: boolean;

  scrollBottom: () => void;
  fetchInstagram: ({
    commentId,
    postId,
    limit
  }: {
    commentId?: string;
    postId?: string;
    limit?: number;
  }) => void;
  refetchComments: (variables) => void;
};

type State = {
  isResolved: boolean;
};

const getAttr = (comment: IInstagramComment, attr: string) => {
  if (!comment) {
    return;
  }

  return comment[attr];
};

export default class InstagramConversation extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isResolved: false
    };
  }

  onToggleClick = () => {
    const { isResolved } = this.state;

    this.setState({ isResolved: !isResolved });
    this.props.refetchComments(!isResolved);
  };

  fetchComments = () => {
    const { post, comments, fetchInstagram } = this.props;

    if (!post) {
      return;
    }

    const limit = comments.length + 5;

    fetchInstagram({ postId: post.erxesApiId, limit });
  };

  renderReplies(comment: IInstagramComment) {
    const { comments, fetchInstagram } = this.props;

    const replies = comments.filter(msg => {
      const parentId = getAttr(msg, 'parentId');

      return parentId && parentId === getAttr(comment, 'commentId');
    });

    return replies.map(reply => (
      <React.Fragment key={reply.commentId}>
        <InstagramComment
          isReply={true}
          comment={reply}
          fetchInstagram={fetchInstagram}
        />
      </React.Fragment>
    ));
  }

  renderComments() {
    const { comments } = this.props;

    const parentComments: IInstagramComment[] = [];

    for (const comment of comments) {
      if (!getAttr(comment, 'parentId')) {
        parentComments.push(comment);
      }
    }

    return parentComments.map(comment => (
      <React.Fragment key={comment.commentId}>
        <InstagramComment
          comment={comment}
          fetchInstagram={this.props.fetchInstagram}
        />
        {this.renderReplies(comment)}
      </React.Fragment>
    ));
  }

  renderInternals(internalNotes: IMessage[]) {
    return internalNotes.map(message => {
      return (
        <SimpleMessage
          message={message}
          isStaff={!message.customerId}
          key={message._id}
        />
      );
    });
  }

  renderViewMore() {
    if (this.props.hasMore) {
      return (
        <ShowMore onClick={this.fetchComments}>View previous comments</ShowMore>
      );
    }

    return null;
  }

  render() {
    const {
      post,
      customer,
      internalNotes,
      scrollBottom,
      commentCount
    } = this.props;

    if (!post) {
      return null;
    }

    return (
      <React.Fragment>
        <InstagramPost
          post={post}
          commentCount={commentCount}
          customer={customer}
          scrollBottom={scrollBottom}
          onToggleClick={this.onToggleClick}
          isResolved={this.state.isResolved}
        />
        {this.renderViewMore()}
        {this.renderComments()}
        {this.renderInternals(internalNotes)}
      </React.Fragment>
    );
  }
}
