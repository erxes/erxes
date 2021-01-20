import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import { IMessage } from 'modules/inbox/types';
import React from 'react';
import { AppMessageBox, CallBox, CallButton, UserInfo } from '../styles';

type Props = {
  message: IMessage;
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
        <CallButton>
          <a target="_blank" rel="noopener noreferrer" href={videoCallData.url}>
            {__('Join a call')}
          </a>
        </CallButton>
      </AppMessageBox>
    </>
  );
};

export default VideoCallMessage;
