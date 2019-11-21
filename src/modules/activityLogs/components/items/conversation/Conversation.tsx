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

    const rows: React.ReactNode[] = [];

    messages.forEach(message => {
      rows.push(
        <Message
          isSameUser={true}
          cconversationFirstMessage={'xaxa'}
          message={message}
          key={message._id}
        />
      );
    });

    return <div />;
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
      </LogWrapper>
    );
  }
}

export default Conversation;
