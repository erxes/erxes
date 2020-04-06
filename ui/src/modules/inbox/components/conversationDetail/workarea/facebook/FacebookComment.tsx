import * as React from 'react';

import ModalTrigger from 'modules/common/components/ModalTrigger';
import NameCard from 'modules/common/components/nameCard/NameCard';
import { IFacebookComment } from 'modules/inbox/types';
import Date from './Date';
import FacebookContent from './FacebookContent';
import { ChildPost, Comment, FlexItem, Reply, ShowMore, User } from './styles';
import UserName from './UserName';

import Icon from 'modules/common/components/Icon';
import ReplyingMessage from './ReplyingMessage';

type Props = {
  comment: IFacebookComment;
  isReply?: boolean;
  replyComment: (
    data: {
      conversationId: string;
      commentId: string;
      content: string;
    },
    callback: () => void
  ) => void;
  fetchFacebook: (
    {
      commentId,
      postId,
      limit
    }: { commentId?: string; postId?: string; limit?: number }
  ) => void;
};

export default class FacebookComment extends React.Component<
  Props,
  { hasReplies: boolean }
> {
  constructor(props) {
    super(props);

    const data = props.comment;
    let hasReplies = false;

    if (data && data.commentCount && data.commentCount > 0) {
      hasReplies = true;
    }

    this.state = {
      hasReplies
    };
  }

  fetchReplies = commentId => {
    const { fetchFacebook } = this.props;

    fetchFacebook({ commentId });

    this.setState({ hasReplies: false });
  };

  changeHasReply = () => {
    this.setState({ hasReplies: true });
  };

  render() {
    const { comment, replyComment, isReply } = this.props;
    const customer = comment.customer || {};

    if (!comment) {
      return null;
    }

    const size = comment && comment.parentId ? 20 : 32;

    const content = props => (
      <ReplyingMessage
        changeHasReply={this.changeHasReply}
        conversationId={comment.conversationId}
        commentId={comment.commentId}
        currentUserName={`${customer.firstName} ${customer.lastName || ''}`}
        replyComment={replyComment}
        {...props}
      />
    );

    return (
      <>
        <ChildPost isReply={comment.parentId}>
          <NameCard.Avatar customer={comment.customer} size={size} />

          <User isReply={comment.parentId}>
            <FlexItem>
              <Comment>
                <UserName
                  username={`${customer.firstName} ${customer.lastName || ''}`}
                />
                <FacebookContent
                  content={comment.content}
                  attachments={comment.attachments}
                />
              </Comment>
            </FlexItem>

            {!isReply ? (
              <Reply>
                <ModalTrigger
                  title="Reply"
                  trigger={<span> Reply •</span>}
                  content={content}
                />
              </Reply>
            ) : null}

            <Date type="comment" timestamp={comment.timestamp} />
          </User>
        </ChildPost>
        {this.state.hasReplies && (
          <ShowMore
            onClick={this.fetchReplies.bind(this, comment.commentId)}
            isReply={true}
          >
            <Icon icon="reply" />
            <span>View more replies</span>
          </ShowMore>
        )}
      </>
    );
  }
}
