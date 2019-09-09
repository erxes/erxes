// import { FacebookComment } from 'modules/inbox/containers/conversationDetail';
import * as React from 'react';

import { ICustomer } from 'modules/customers/types';
import { IFacebookComment, IFacebookPost } from 'modules/inbox/types';

import FacebookComment from 'modules/inbox/containers/conversationDetail/facebook/FacebookComment';
import FacebookPost from './FacebookPost';
import { ShowMore } from './styles';

// import { ShowMore } from './styles';

type Props = {
  post?: IFacebookPost;
  customer: ICustomer;
  comments: IFacebookComment[];
  hasMore: boolean;

  // scrollBottom: () => void;
  fetchFacebook: (
    {
      commentId,
      postId,
      limit
    }: { commentId?: string; postId?: string; limit?: number }
  ) => void;
};

const getAttr = (comment: IFacebookComment, attr: string) => {
  if (!comment) {
    return;
  }

  return comment[attr];
};

export default class FacebookConversation extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  fetchComments = () => {
    const { post, comments } = this.props;
    if (!post) {
      return;
    }

    const limit = comments.length + 5;

    this.props.fetchFacebook({
      postId: post.postId,
      limit
    });
  };

  renderReplies(comment: IFacebookComment) {
    const { comments } = this.props;

    const replies = comments.filter(msg => {
      const parentId = getAttr(msg, 'parentId');

      return parentId && parentId === getAttr(comment, 'commentId');
    });

    return replies.map(reply => (
      <React.Fragment key={reply.commentId}>
        <FacebookComment
          comment={reply}
          fetchFacebook={this.props.fetchFacebook}
        />
      </React.Fragment>
    ));
  }

  renderComments() {
    const { comments } = this.props;

    const parentComments: IFacebookComment[] = [];

    for (const comment of comments) {
      if (!getAttr(comment, 'parentId')) {
        parentComments.push(comment);
      }
    }

    return parentComments.map(comment => (
      <React.Fragment key={comment.commentId}>
        <FacebookComment
          comment={comment}
          fetchFacebook={this.props.fetchFacebook}
        />
        {this.renderReplies(comment)}
      </React.Fragment>
    ));
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
    const { post, customer, comments } = this.props;

    if (!post) {
      return null;
    }

    return (
      <React.Fragment>
        <FacebookPost post={post} customer={customer} />
        {this.renderViewMore()}
        {this.renderComments()}
      </React.Fragment>
    );
  }
}
