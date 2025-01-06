import { Alert, __ } from '@erxes/ui/src/utils';

import {
  IncomingActionButton,
  IncomingButtonContainer,
  IncomingCallNav,
  IncomingContainer,
  IncomingContent,
  NameCardContainer,
  PhoneNumber,
} from '../styles';
import React, { useEffect, useRef, useState } from 'react';
import { callActions } from '../utils';

import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import { ICustomer } from '../types';
import Icon from '@erxes/ui/src/components/Icon';
import { renderFullName } from '@erxes/ui/src/utils/core';
import { useNavigate } from 'react-router-dom';
import { PullAudioTracks } from './PullAudioTracks';

type Props = {
  customer: ICustomer;
  channels: any;
  hasMicrophone: boolean;
  phoneNumber: string;
  hideIncomingCall?: boolean;
  erxesApiId: string;
  currentCallConversationId: string;
  answerCall: () => void;
  leaveCall: (seconds: number) => void;
  audioTrack?: string;
};

const getSpentTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);

  seconds -= hours * 3600;

  const minutes = Math.floor(seconds / 60);

  seconds -= minutes * 60;

  return (
    <>
      {hours !== 0 && formatNumber(hours)}
      {hours !== 0 && <span> : </span>}
      {formatNumber(minutes)}
      <span> : </span>
      {formatNumber(seconds)}
    </>
  );
};

const formatNumber = (n: number) => {
  return n.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
};

const IncomingCall = (props: Props) => {
  const {
    customer,
    hasMicrophone,
    phoneNumber,
    channels,
    hideIncomingCall,
    currentCallConversationId,
    erxesApiId,
    answerCall,
    leaveCall,
    audioTrack,
  } = props;

  const primaryPhone = customer?.primaryPhone || '';

  const navigate = useNavigate();

  const [haveIncomingCall, setHaveIncomingCall] = useState(
    primaryPhone ? true : false,
  );

  const [timeSpent, setTimeSpent] = useState(0);
  const [status, setStatus] = useState(phoneNumber ? 'active' : 'pending');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (audioRef.current) {
      audioRef.current.src = '/sound/incoming.mp3';
      audioRef.current.play();
    }
    if (status === 'accepted') {
      timer = setInterval(() => {
        setTimeSpent((prevTimeSpent) => prevTimeSpent + 1);
      }, 1000);
    }
    if (status !== 'accepted') {
      setHaveIncomingCall(true);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      clearInterval(timer);
    };
  }, [status, primaryPhone, audioRef.current]);

  const endCall = () => {
    leaveCall(timeSpent);
  };

  const onAcceptCall = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (!hasMicrophone) {
      return Alert.error('Check your microphone');
    }

    setStatus('accepted');
    setHaveIncomingCall(false);
    answerCall();
  };

  const onDeclineCall = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    setHaveIncomingCall(false);
    answerCall();
  };

  const gotoDetail = () => {
    navigate(`/inbox/index?_id=${currentCallConversationId}`, {
      replace: true,
    });
  };
  const toggleMic = () => {
    // audioEnabled ? turnMicOff() : turnMicOn();
  };

  const renderUserInfo = (type?: string) => {
    const inCall = type === 'incall' ? true : false;
    const hasChannel = channels?.length > 0;
    const channelName = channels?.[0]?.name || '';
    const fullName = renderFullName(customer || '', false);

    return (
      <NameCardContainer>
        <h5>{__('Call')}</h5>
        <Avatar user={customer} size={inCall ? 72 : 30} />
        <h4>{fullName === 'Unknown' ? phoneNumber : fullName}</h4>
        <h1>{phoneNumber}</h1>
        {primaryPhone && (
          <PhoneNumber>
            {primaryPhone}

            {hasChannel && (
              <span>
                {__('is calling to')} {channelName}
              </span>
            )}
          </PhoneNumber>
        )}
      </NameCardContainer>
    );
  };

  if (haveIncomingCall) {
    return (
      <>
        <audio ref={audioRef} loop autoPlay />
        <IncomingCallNav>
          <IncomingContainer>
            <IncomingContent>
              {renderUserInfo()}
              <IncomingButtonContainer>
                <div>
                  <IncomingActionButton onClick={onAcceptCall} type="accepted">
                    <Icon icon="phone-alt" size={20} />
                  </IncomingActionButton>
                  <b>{__('Accept')}</b>
                </div>
                <div>
                  <IncomingActionButton onClick={onDeclineCall} type="decline">
                    <Icon icon="phone-slash" size={20} />
                  </IncomingActionButton>
                  <b>{__('Decline')}</b>
                </div>
              </IncomingButtonContainer>
            </IncomingContent>
          </IncomingContainer>
        </IncomingCallNav>
      </>
    );
  }

  if (status === 'accepted' && !haveIncomingCall && !hideIncomingCall) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const renderContent = () => {
      return (
        <>
          {renderUserInfo('incall')}
          <p>
            {__('Call duration:')} <b>{getSpentTime(timeSpent)}</b>
          </p>
          {callActions(
            {
              isMuted: () => {
                return true;
              },
            },
            toggleMic,
            endCall,
            erxesApiId,
            true,
            { direction: 'incoming' },
            gotoDetail,
            currentCallConversationId && currentCallConversationId.length !== 0
              ? false
              : true,
            { onClickKeyPad: () => {} },
          )}
        </>
      );
    };

    return hasMicrophone ? (
      <PullAudioTracks audioTracks={audioTrack ? [audioTrack] : []}>
        <IncomingCallNav>
          <IncomingContainer>
            <IncomingContent>{renderContent()}</IncomingContent>
          </IncomingContainer>
        </IncomingCallNav>
      </PullAudioTracks>
    ) : (
      <h3>Check your microphone</h3>
    );
  }

  return null;
};

export default IncomingCall;
