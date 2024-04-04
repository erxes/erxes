import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import DealConvertTrigger from '@erxes/ui-cards/src/deals/components/DealConvertTrigger';
import TaskConvertTrigger from '@erxes/ui-cards/src/tasks/components/TaskConvertTrigger';
import PurchaseConvertTrigger from '@erxes/ui-cards/src/purchases/components/PurchaseConvertTrigger';
import TicketConvertTrigger from '@erxes/ui-cards/src/tickets/components/TicketConvertTrigger';
import * as React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import styled from 'styled-components';
import { IFacebookComment } from '../../../types';
import Date from './Date';
import FacebookContent from './FacebookContent';
import ReplyingMessage from './ReplyingMessage';
import { ChildPost, FlexItem, Reply, ShowMore, User } from './styles';
import UserName from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/facebook/UserName';
import { Comment } from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/facebook/styles';

const Container = styled.div`
  display: inline-block;

  .dropdown-menu {
    min-width: auto;
  }

  button {
    padding: 3px 7px 3px 12px;
    font-size: 10px;
  }
`;

type Props = {
  comment: IFacebookComment;
  isReply?: boolean;
  convertToInfo: {
    ticketUrl?: string;
    dealUrl?: string;
    taskUrl?: string;
    purchaseUrl?: string;
  };
  changeStatusComment: () => void;
  replyComment: (
    data: {
      conversationId: string;
      commentId: string;
      content: string;
    },
    callback: () => void
  ) => void;
  fetchFacebook: ({
    commentId,
    postId,
    limit
  }: {
    commentId?: string;
    postId?: string;
    limit?: number;
  }) => void;
  refetch: () => void;
};

export default class FacebookComment extends React.Component<
  Props,
  { hasReplies: boolean; isResolved: boolean }
> {
  constructor(props) {
    super(props);

    const data = props.comment;
    let hasReplies = false;

    if (data && data.commentCount && data.commentCount > 0) {
      hasReplies = true;
    }

    this.state = {
      hasReplies,
      isResolved: data.isResolved ? true : false
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

  changeStatusComment = () => {
    const { isResolved } = this.state;
    const { changeStatusComment } = this.props;

    this.setState({ isResolved: isResolved ? false : true });

    return changeStatusComment();
  };

  collectAttachments = () => {
    const { comment } = this.props;
    const result = [] as any;

    if (comment.attachments && comment.attachments.length > 0) {
      const { attachments } = comment;

      attachments.forEach((link, index) => {
        if (link.includes('fna.fbcdn.net')) {
          result.push({
            url: link,
            name: 'attachment',
            type: 'image / jpeg,'
          });
        }
      });
    }

    return result;
  };

  render() {
    const {
      comment,
      replyComment,
      isReply,
      convertToInfo,
      refetch
    } = this.props;
    const { isResolved } = this.state;

    const customer = comment.customer || ({} as any);

    if (!comment) {
      return null;
    }

    const size = comment && comment.parentId ? 20 : 32;
    const statusText = isResolved ? 'Open' : 'Resolve';

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

    const triggerProps = {
      relTypeIds: [customer._id],
      relType: 'customer',
      sourceConversationId: comment.commentId,
      refetch,
      description: comment.content,
      attachments: this.collectAttachments()
    };

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
              <Reply type="reply">
                <ModalTrigger
                  title="Reply"
                  trigger={<span>Reply</span>}
                  content={content}
                />
              </Reply>
            ) : null}
            <Container>
              <Dropdown>
                <Dropdown.Toggle as={DropdownToggle} id="dropdown-convert-to">
                  <Reply type="convert">
                    <span>Convert</span>
                  </Reply>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <li key="ticket">
                    <TicketConvertTrigger
                      {...triggerProps}
                      url={convertToInfo.ticketUrl}
                    />
                  </li>
                  <li key="deal">
                    <DealConvertTrigger
                      {...triggerProps}
                      url={convertToInfo.dealUrl}
                    />
                  </li>
                  <li key="task">
                    <TaskConvertTrigger
                      {...triggerProps}
                      url={convertToInfo.taskUrl}
                    />
                  </li>
                  <li key="purchase">
                    <PurchaseConvertTrigger
                      {...triggerProps}
                      url={convertToInfo.purchaseUrl}
                    />
                  </li>
                </Dropdown.Menu>
              </Dropdown>
            </Container>

            <Reply type={statusText}>
              <span onClick={this.changeStatusComment}>{statusText}</span>
            </Reply>
            <span>
              <Date
                type="comment"
                timestamp={comment.timestamp}
                permalink_url={comment.permalink_url}
              />
            </span>
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
