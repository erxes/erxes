import dayjs from 'dayjs';
import {
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  CenterText,
  Collapse,
  ConversationContent,
  Count,
  FlexBody,
  FlexCenterContent,
  Header
} from 'modules/activityLogs/styles';
import { getIconAndColor } from 'modules/activityLogs/utils';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { renderFullName } from 'modules/common/utils';
import Message from 'modules/inbox/components/conversationDetail/workarea/conversation/messages/Message';
import {
  Comment,
  PostContainer
} from 'modules/inbox/components/conversationDetail/workarea/facebook/styles';
import UserName from 'modules/inbox/components/conversationDetail/workarea/facebook/UserName';
import MailConversation from 'modules/inbox/components/conversationDetail/workarea/mail/MailConversation';
import Resolver from 'modules/inbox/containers/Resolver';
import { IConversation, IFacebookComment, IMessage } from 'modules/inbox/types';
import React from 'react';
import { Link } from 'react-router-dom';
import xss from 'xss';

type Props = {
  activity: any;
  conversation: IConversation;
  messages: IMessage[];
  comments: IFacebookComment[];
};

class Conversation extends React.Component<Props, { toggleMessage: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      toggleMessage: false
    };
  }

  onCollapse = () => {
    this.setState({ toggleMessage: !this.state.toggleMessage });
  };

  renderComments() {
    const { comments } = this.props;

    if (!comments || comments.length === 0) {
      return null;
    }

    return comments.map(comment => (
      <div key={comment.commentId}>
        <Comment>
          <UserName
            username={`${comment.customer.firstName} ${comment.customer
              .lastName || ''}`}
          />
          <p
            dangerouslySetInnerHTML={{
              __html: xss(comment.content)
            }}
          />
        </Comment>
      </div>
    ));
  }

  renderMessages() {
    const { conversation, messages } = this.props;

    if (!conversation) {
      return null;
    }

    const { kind } = conversation.integration;

    if (kind === 'facebook-post') {
      return (
        <>
          <PostContainer>{conversation.content}</PostContainer>
          {this.renderComments()}
        </>
      );
    }

    if (kind === 'nylas-gmail') {
      return (
        <MailConversation
          conversation={conversation}
          conversationMessages={messages}
        />
      );
    }

    const rows: React.ReactNode[] = [];
    let tempId;

    messages.forEach(message => {
      tempId = message.userId ? message.userId : message.customerId;

      rows.push(
        <Message
          isSameUser={
            message.userId
              ? message.userId === tempId
              : message.customerId === tempId
          }
          message={message}
          key={message._id}
        />
      );
    });

    return (
      <>
        {rows}
        {messages.length >= 10 && (
          <CenterText>
            <Link to={`/inbox/index?_id=${conversation._id}`}>
              Read more <Icon icon="angle-double-right" />
            </Link>
          </CenterText>
        )}
      </>
    );
  }

  renderAction() {
    const { activity, conversation } = this.props;
    const { _id, customer, integration } = conversation;

    let kind = integration ? integration.kind : 'conversation';

    const condition =
      activity.contentType === 'comment' ? activity.contentType : kind;

    let action = 'sent a';
    let item = 'message';

    switch (condition) {
      case 'chatfuel':
        kind = 'chatfuel';
        break;
      case 'callpro':
        action = 'made a';
        kind = 'phone call';
        item = 'by CallPro';
        break;
      case 'comment':
        action = '';
        kind = 'commented';
        item = 'on Facebook Post';
        break;
      case 'facebook-post':
        action = 'wrote a Facebook';
        kind = 'Post';
        item = '';
        break;
      case 'facebook-messenger':
        kind = 'message';
        item = 'by Facebook Messenger';
        break;
      case 'lead':
        action = 'filled in';
        kind = 'Lead form';
        item = '';
        break;
      case 'nylas-gmail':
        action = 'send';
        kind = 'email';
        item = 'by gmail';
        break;
    }

    return (
      <FlexBody>
        <b>{renderFullName(customer)}</b> {action}&nbsp;
        <Link to={`/inbox/index?_id=${_id}`}>
          <strong>{kind}</strong>
        </Link>
        &nbsp;{item}
      </FlexBody>
    );
  }

  renderContent() {
    const { conversation, messages } = this.props;

    const { customer, content, createdAt, integration } = conversation;

    if (this.state.toggleMessage) {
      return (
        <>
          <Header>
            <FlexCenterContent>
              {integration.kind.includes('messenger') ? (
                <span>
                  Conversation with <b>{renderFullName(customer)}</b>
                </span>
              ) : (
                <span>{this.renderAction()}</span>
              )}
              <Resolver conversations={[conversation]} />
            </FlexCenterContent>
          </Header>
          {this.renderMessages()}
        </>
      );
    }

    return (
      <>
        <FlexCenterContent>
          {this.renderAction()}

          <Tip text={dayjs(createdAt).format('llll')}>
            <ActivityDate>
              {dayjs(createdAt).format('MMM D, h:mm A')}
            </ActivityDate>
          </Tip>
        </FlexCenterContent>
        {content && (
          <FlexCenterContent>
            <ConversationContent
              dangerouslySetInnerHTML={{ __html: xss(content) }}
            />
            <Count>{messages && messages.length}</Count>
          </FlexCenterContent>
        )}
      </>
    );
  }

  render() {
    const { conversation, activity } = this.props;
    const { integration } = conversation;

    const kind = integration ? integration.kind : 'conversation';

    const condition =
      activity.contentType === 'comment' ? activity.contentType : kind;

    const iconAndColor = getIconAndColor(condition);

    return (
      <ActivityRow key={Math.random()} isConversation={true}>
        <ActivityIcon color={iconAndColor.color}>
          <Icon icon={iconAndColor.icon} />
        </ActivityIcon>
        <Collapse onClick={this.onCollapse}>{this.renderContent()}</Collapse>
      </ActivityRow>
    );
  }
}

export default Conversation;
