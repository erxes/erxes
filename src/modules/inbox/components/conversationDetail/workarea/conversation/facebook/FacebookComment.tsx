import { ModalTrigger, NameCard } from 'modules/common/components';
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
  scrollBottom: () => void;
};

export default class FacebookComment extends React.Component<Props, {}> {
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

    return (
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
              content={props => (
                <ReplyingMessage
                  conversationId={message.conversationId}
                  commentId={data.commentId}
                  currentUserName={data.senderName}
                  replyPost={replyPost}
                  {...props}
                />
              )}
            />
          </Reply>

          <Date message={message} />
        </User>
      </ChildPost>
    );
  }
}
