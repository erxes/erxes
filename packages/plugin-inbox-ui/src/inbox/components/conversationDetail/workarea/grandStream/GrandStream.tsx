import {
  Audio,
  CallWrapper,
  Download,
  StatusContent,
  StatusIcon,
} from './styles';
import {
  ICallHistory,
  IConversation,
  ICallCdrData,
} from '@erxes/ui-inbox/src/inbox/types';
import {
  MessageBody,
  MessageItem,
} from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/styles';
import React, { useRef } from 'react';

import { AppConsumer } from 'coreui/appContext';
import { IUser } from '@erxes/ui/src/auth/types';
import Icon from '@erxes/ui/src/components/Icon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import { can } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import { readFile } from '@erxes/ui/src/utils/core';
import ReactAudioPlayer from 'react-audio-player';

type Props = {
  conversation: IConversation;
  currentUser: IUser;
};

const GrandStream: React.FC<Props> = ({ conversation, currentUser }) => {
  const audioRef = useRef(null) as any;
  const {
    callDuration,
    callStatus,
    callType,
    createdAt,
    recordUrl,
    customerPhone,
    operatorPhone,
  } = conversation.callHistory || ({} as ICallHistory);
  const {
    end,
    start,
    disposition,
    billsec,
    userfield,
    // createdAt,
    recordUrl: cdrRecordUrl,
    dst,
    src,
  } = conversation.callCdr || ({} as ICallCdrData);

  const audioTitle =
    `operatorPhone:${src || operatorPhone}-` +
    `customerPhone:${dst || customerPhone}-` +
    `${disposition || callType}:${userfield || callStatus}` +
    dayjs(createdAt).format('YYYY-MM-DD HH:mm');

  const handleDownload = () => {
    const audioSrc = audioRef?.current?.querySelector('source').src;

    fetch(audioSrc)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `${audioTitle}.wav`); // Set the desired file name here
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      })
      .catch((error) =>
        console.error('Error downloading the audio file:', error),
      );
  };

  const renderDownloadAudio = () => {
    if (!can('showCallRecord', currentUser) || !recordUrl) {
      return null;
    }
    return (
      <Tip text={__('Download audio')} placement="top">
        <Download href="#" onClick={handleDownload} id="downloadButton">
          <Icon icon="download-1" size={16} />
        </Download>
      </Tip>
    );
  };

  const renderAudio = () => {
    const url = cdrRecordUrl || recordUrl;
    return (
      can('showCallRecord', currentUser) && (
        <Audio>
          <ReactAudioPlayer
            src={readFile(url)}
            controls
            controlsList="nodownload"
          />
        </Audio>
      )
    );
  };

  const renderIcon = () => {
    switch (userfield || callStatus) {
      case 'connected':
        return 'missed-call';
      case 'missed':
        return 'missed-call';
      case 'Inbound':
        return 'Call ended';
      case 'Outbound':
        return 'Outgoing call';
      case 'cancelled':
        return 'phone-times';
      default:
        return 'phone-slash';
    }
  };

  const renderCallStatus = () => {
    switch (userfield || callStatus) {
      case 'connected':
        return 'Call ended';
      case 'missed':
        return 'Missed call';
      case 'Inbound':
        return 'Call ended';
      case 'Outbound':
        return 'Outgoing call';
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
            <div>
              <StatusIcon type={userfield || callStatus}>
                <Icon icon={renderIcon()} size={16} />
              </StatusIcon>
              <div>
                <h5>
                  {__(renderCallStatus())} ({disposition || callType})
                </h5>
                <span>Call duration: {billsec || callDuration || 0}s</span>
              </div>
            </div>
            <div>{renderDownloadAudio()}</div>
          </StatusContent>
          {(cdrRecordUrl || recordUrl) && renderAudio()}
        </CallWrapper>
        <Tip text={dayjs(start || createdAt).format('lll')}>
          <footer>{dayjs(start || createdAt).format('LT')}</footer>
        </Tip>
      </MessageBody>
    </MessageItem>
  );
};

const WithConsumer = (props: { conversation: IConversation }) => {
  return (
    <AppConsumer>
      {({ currentUser }) => (
        <GrandStream {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
