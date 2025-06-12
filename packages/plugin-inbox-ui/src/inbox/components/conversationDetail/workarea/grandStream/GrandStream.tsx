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
import Button from '@erxes/ui/src/components/Button';

type Props = {
  conversation: IConversation;
  currentUser: IUser;
  syncRecordFile: (acctId: string, inboxId: string) => void;
};

const GrandStream: React.FC<Props> = ({
  conversation,
  currentUser,
  syncRecordFile,
}) => {
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
    start,
    disposition,
    billsec,
    userfield,
    recordUrl: cdrRecordUrl,
    dst,
    src,
    acctId,
    end,
    actionType,
    duration,
  } = conversation.callCdr || ({} as ICallCdrData);
  console.log(conversation.callCdr, 'conversation.callCdr');
  const audioTitle =
    `operatorPhone:${src || operatorPhone}-` +
    `customerPhone:${dst || customerPhone}-` +
    `${disposition || callType}:${userfield || callStatus}` +
    dayjs(createdAt).format('YYYY-MM-DD HH:mm');

  const ringTimeSec = Math.round(
    (new Date(end || '').getTime() - new Date(start || '').getTime()) / 1000,
  );
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
    if (!can('showCallRecord', currentUser) || (!cdrRecordUrl && !recordUrl)) {
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
        <>
          <Audio>
            <ReactAudioPlayer
              src={readFile(url)}
              controls
              controlsList="nodownload"
            />
          </Audio>
          <Button
            id="cdrRecordUrl"
            btnStyle="warning"
            size="small"
            onClick={() => {
              syncRecordFile(acctId, conversation?.integration?._id);
            }}
          >
            <Icon icon="sync" />
            {__('sync record file')}
          </Button>
        </>
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
  const ivrEnded =
    actionType?.startsWith('IVR') &&
    disposition === 'ANSWERED' &&
    billsec &&
    billsec < 30;

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
                  {__(renderCallStatus())}{' '}
                  {`${!ivrEnded ? disposition || callType : ''} `}
                </h5>
                {ivrEnded && (
                  <div style={{ color: 'gray' }}>
                    <Icon icon="menu" /> Caller entered IVR <br /> but hung up
                    after {duration} seconds <br /> without choosing an option.
                  </div>
                )}
                {disposition === 'NO ANSWER' && !ivrEnded && (
                  <div style={{ color: 'orange' }}>
                    <Icon icon="phone-slash" /> Caller waited {ringTimeSec}s{' '}
                    <br /> but no one answered.
                  </div>
                )}
                {disposition !== 'NO ANSWER' && !ivrEnded && (
                  <span>Call duration: {billsec || callDuration || 0}s</span>
                )}
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

const WithConsumer = (props: {
  conversation: IConversation;
  syncRecordFile;
}) => {
  return (
    <AppConsumer>
      {({ currentUser }) => (
        <GrandStream {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
