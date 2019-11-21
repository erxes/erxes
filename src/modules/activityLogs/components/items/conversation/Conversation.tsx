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
import { IConversation } from 'modules/inbox/types';
import React from 'react';

type Props = {
  activity: any;
  conversation: IConversation;
};

class Conversation extends React.Component<Props, { editing: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      editing: false
    };
  }

  render() {
    const { conversation } = this.props;

    console.log(conversation);

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
