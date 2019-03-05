import { Icon, ModalTrigger, NameCard } from 'modules/common/components';
import * as React from 'react';
import { IMessage } from '../../../../../types';
import {
  Date,
  FacebookContent,
  Reactions,
  ReplyingMessage,
  UserName
} from './';
import {
  ChildPost,
  Comment,
  FlexItem,
  Reply,
  ReplyReaction,
  ShowMore,
  User
} from './styles';

type Props = {
  message: IMessage;
  replyPost: (
    data: {
      conversationId: string;
      content: string;
      commentReplyToId?: string;
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
  scrollBottom?: () => void;
};

export default class FacebookComment extends React.Component<
  Props,
  { hasReplies: boolean }
> {
  constructor(props) {
    super(props);

    const data = props.message.facebookData;

    let hasReplies = false;

    if (data && data.commentCount && data.commentCount > 0) {
      hasReplies = true;
    }

    this.state = {
      hasReplies
    };
  }

  renderReactionCount() {
    const data = this.props.message.facebookData;

    if (!data) {
      return null;
    }

    if (data.likeCount === 0) {
      return null;
    }

    return (
      <ReplyReaction>
        {data.reactions && (
          <Reactions reactions={data.reactions} comment={true} />
        )}
        <a>{data.likeCount}</a>
      </ReplyReaction>
    );
  }

  fetchReplies = commentId => {
    const { fetchFacebook } = this.props;

    fetchFacebook({ commentId });

    this.setState({ hasReplies: false });
  };

  render() {
    const { message, replyPost, scrollBottom } = this.props;
    const data = message.facebookData;

    if (!data) {
      return null;
    }

    const size = data && data.parentId ? 20 : 32;
    let commentVideo = '';

    if (message.content.includes('youtube.com')) {
      commentVideo = message.content;
    }

    const content = props => (
      <ReplyingMessage
        conversationId={message.conversationId}
        commentId={data.commentId}
        currentUserName={data.senderName}
        replyPost={replyPost}
        {...props}
      />
    );

    return (
      <>
        <ChildPost isReply={data.parentId}>
          <NameCard.Avatar customer={message.customer} size={size} />

          <User isReply={data.parentId}>
            <FlexItem>
              <Comment isInternal={message.internal}>
                <UserName username={data.senderName} userId={data.senderId} />
                <FacebookContent
                  content={message.content}
                  scrollBottom={scrollBottom}
                  image={data.photo}
                  link={data.link || data.video || commentVideo}
                />
              </Comment>
              {this.renderReactionCount()}
            </FlexItem>

            <Reply>
              <ModalTrigger
                title="Reply"
                trigger={<a> Reply •</a>}
                content={content}
              />
            </Reply>

            <Date message={message} />
          </User>
        </ChildPost>
        {this.state.hasReplies && (
          <ShowMore
            onClick={this.fetchReplies.bind(this, data.commentId)}
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
