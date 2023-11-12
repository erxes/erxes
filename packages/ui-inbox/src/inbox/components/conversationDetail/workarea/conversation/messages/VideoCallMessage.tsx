import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { IMessage } from '../../../../../types';
import { AppMessageBox, CallBox, CallButton, UserInfo } from '../styles';

type Props = {
  message: IMessage;
};

const openWindow = (conversationId: string, url: string, name: string) => {
  if (!window || !window.top) {
    return;
  }

  const height = 600;
  const width = 480;

  const y = window.top.outerHeight / 2 + window.top.screenY - height / 2;
  const x = window.top.outerWidth / 2 + window.top.screenX - width / 2;

  window.open(
    `/videoCall?url=${url}&name=${name}&conversationId=${conversationId}`,
    '_blank',
    `toolbar=no,titlebar=no,directories=no,menubar=no,location=no,scrollbars=yes,status=no,height=${height},width=${width},top=${y},left=${x}`
  );
};

const VideoCallMessage = (props: Props) => {
  const { message } = props;

  const videoCallData = message.videoCallData || {
    status: 'end',
    url: '',
    recordingLinks: []
  };

  const renderRecordings = () => {
    const recordingLinks = videoCallData.recordingLinks || [];

    return recordingLinks.map((link, index) => {
      const openTab = () => {
        window.open(`/videoCall/recording?link=${link}`);
      };

      return (
        <span key={index} onClick={openTab}>
          Recording {index + 1}
        </span>
      );
    });
  };

  if (videoCallData.status === 'end') {
    return (
      <>
        <CallBox>
          <UserInfo>
            <strong>
              <Icon icon="phone-slash" color="#EA475D" size={15} />{' '}
              {__('Video call ended')}
            </strong>
            {renderRecordings()}
          </UserInfo>
        </CallBox>
      </>
    );
  }

  return (
    <>
      <AppMessageBox>
        <UserInfo>
          <h5>{__('Video call invitation sent')}</h5>
          <h3>
            <Icon icon="user-plus" color="#3B85F4" />
          </h3>
          {renderRecordings()}
        </UserInfo>
        <CallButton
          onClick={() => {
            openWindow(
              message.conversationId,
              videoCallData.url,
              videoCallData.name || ''
            );
          }}
        >
          <a target="_blank" rel="noopener noreferrer">
            {__('Join a call')}
          </a>
        </CallButton>
      </AppMessageBox>
    </>
  );
};

export default VideoCallMessage;
