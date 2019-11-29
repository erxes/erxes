import dayjs from 'dayjs';
import {
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  AvatarWrapper,
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
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tip from 'modules/common/components/Tip';
import { renderFullName } from 'modules/common/utils';
import { Message } from 'modules/inbox/components/conversationDetail/workarea/conversation/messages';
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

  renderMessages() {
    const { conversation, messages } = this.props;

    if (!conversation) {
      return null;
    }

    const { kind } = conversation.integration;

    if (kind === 'facebook-post') {
      return <span>{conversation.content}</span>;
    }

    if (kind.includes('nylas' || kind === 'gmail')) {
      return <span>ene mailiig yahu zuger contentiin haruulah umu</span>;
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
    const condition =
      activity.contentType === 'comment'
        ? activity.contentType
        : integration.kind;

    let action = 'sent a';
    let kind = 'conversation';
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
        action = 'wrote a Facebook';
        kind = 'Posasdassdat';
        item = '';
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
    const { customer, content, createdAt } = conversation;

    if (this.state.toggleMessage) {
      return (
        <>
          <Header>
            <FlexCenterContent>
              <span>
                Conversation with <b>{renderFullName(customer)}</b>
              </span>
              <Resolver conversations={[conversation]} />
            </FlexCenterContent>
          </Header>
          {this.renderMessages()}
        </>
      );
    }
    // tslint:disable-next-line:no-console
    console.log(this.props);
    return (
      <>
        <FlexCenterContent>
          <AvatarWrapper>
            <NameCard.Avatar size={32} />
          </AvatarWrapper>
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
            <Count>{messages.length}</Count>
          </FlexCenterContent>
        )}
      </>
    );
  }

  render() {
    const { conversation, activity } = this.props;
    const condition =
      activity.contentType === 'comment'
        ? activity.contentType
        : conversation.integration.kind || 'conversation';

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
