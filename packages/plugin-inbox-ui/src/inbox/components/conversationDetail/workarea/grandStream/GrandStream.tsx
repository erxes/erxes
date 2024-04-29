import { Audio, CallWrapper, StatusContent, StatusIcon } from './styles';
import { ICallHistory, IConversation } from '@erxes/ui-inbox/src/inbox/types';
import {
  MessageBody,
  MessageItem,
} from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/styles';

import Icon from '@erxes/ui/src/components/Icon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';
import { readFile } from '@erxes/ui/src/utils/core';

type Props = {
  conversation: IConversation;
};

const GrandStream: React.FC<Props> = ({ conversation }) => {
  const { callDuration, callStatus, callType, createdAt, recordUrl } =
    conversation.callHistory || ({} as ICallHistory);
  const renderAudio = () => {
    return (
      <Audio>
        <span>Recorder</span>
        <audio controls={true}>
          <source src={readFile(recordUrl)} type="audio/wav" />
        </audio>
      </Audio>
    );
  };

  const renderIcon = () => {
    switch (callStatus) {
      case 'connected':
        return 'missed-call';
      case 'missed':
        return 'missed-call';
      case 'cancelled':
        return 'phone-times';
      default:
        return 'phone-slash';
    }
  };

  const renderCallStatus = () => {
    switch (callStatus) {
      case 'connected':
        return 'Call ended';
      case 'missed':
        return 'Missed call';
      case 'cancelled':
        return 'Call cancelled';
      default:
        return 'Outgoing call';
    }
  };

  return (
    <MessageItem>
      <NameCard.Avatar customer={conversation.customer} size={40} />

      <MessageBody>
        <CallWrapper>
          <StatusContent>
            <StatusIcon type={callStatus}>
              <Icon icon={renderIcon()} size={16} />
            </StatusIcon>
            <div>
              <h5>
                {__(renderCallStatus())} ({callType})
              </h5>
              <span>Call duration: {callDuration}s</span>
            </div>
          </StatusContent>
          {recordUrl && renderAudio()}
        </CallWrapper>
        <Tip text={dayjs(createdAt).format('lll')}>
          <footer>{dayjs(createdAt).format('LT')}</footer>
        </Tip>
      </MessageBody>
    </MessageItem>
  );
};

export default GrandStream;
