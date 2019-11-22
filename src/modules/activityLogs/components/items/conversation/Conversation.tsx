import dayjs from 'dayjs';
import {
  ActivityDate,
  AvatarWrapper,
  FlexBody,
  FlexCenterContent,
  LogWrapper
} from 'modules/activityLogs/styles';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tip from 'modules/common/components/Tip';
import { Message } from 'modules/inbox/components/conversationDetail/workarea/conversation/messages';
import { IConversation, IMessage } from 'modules/inbox/types';
import React from 'react';

type Props = {
  activity: any;
  conversation: IConversation;
  messages: IMessage[];
};

class Conversation extends React.Component<Props, { editing: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      editing: false
    };
  }

  renderMessages = () => {
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

      tempId = message.userId ? message.userId : message.customerId;
    });

    return rows;
  };

  render() {
    const { conversation } = this.props;

    return (
      <LogWrapper>
        <FlexCenterContent>
          <AvatarWrapper>
            <NameCard.Avatar />
          </AvatarWrapper>
          <FlexBody>Conversation</FlexBody>

          <Tip text={dayjs(conversation.createdAt).format('llll')}>
            <ActivityDate>
              {dayjs(conversation.createdAt).format('MMM D, h:mm A')}
            </ActivityDate>
          </Tip>
        </FlexCenterContent>
        {this.renderMessages()}
      </LogWrapper>
    );
  }
}

export default Conversation;
