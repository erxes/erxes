import { Alert, __ } from '@erxes/ui/src/utils';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import Icon from '@erxes/ui/src/components/Icon';
import { renderFullName } from '@erxes/ui/src/utils/core';
import { callActions } from '../utils';
import { PullAudioTracks } from './PullAudioTracks';
import {
  Actions,
  CallAction,
  InCallFooter,
  IncomingActionButton,
  IncomingButtonContainer,
  IncomingCallNav,
  IncomingContainer,
  IncomingContent,
  InnerActions,
  NameCardContainer,
  PhoneNumber,
} from '../styles';
import { ICustomer } from '../types';

type Props = {
  customer: ICustomer;
  channels: any;
  hasMicrophone: boolean;
  phoneNumber: string;
  hideIncomingCall?: boolean;
  erxesApiId: string;
  currentCallConversationId: string;
  answerCall: () => void;
  leaveCall: ({ roomState }: { roomState?: string }) => void;
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
  const [timeSpent, setTimeSpent] = useState(0);
  const [status, setStatus] = useState(phoneNumber ? 'active' : 'pending');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Derive haveIncomingCall from status and primaryPhone
  const haveIncomingCall = useMemo(() => {
    return status === 'active';
  }, [status, phoneNumber]);

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

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      clearInterval(timer);
    };
  }, [status]);

  const endCall = useCallback(() => {
    leaveCall({ roomState: 'leave' });
  }, [leaveCall]);

  const onAcceptCall = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (!hasMicrophone) {
      return Alert.error('Check your microphone');
    }

    setStatus('accepted');
    answerCall();
  }, [hasMicrophone, answerCall]);

  const onDeclineCall = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    setStatus('declined');
    leaveCall({ roomState: 'busy' });
  }, []);

  const gotoDetail = useCallback(() => {
    navigate(`/inbox/index?_id=${currentCallConversationId}`, {
      replace: true,
    });
  }, [navigate, currentCallConversationId]);

  const toggleMic = useCallback(() => {
    // audioEnabled ? turnMicOff() : turnMicOn();
  }, []);

  const renderUserInfo = useCallback(
    (type?: string) => {
      const inCall = type === 'incall';
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
    },
    [customer, channels, phoneNumber, primaryPhone],
  );

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

  if (status === 'accepted') {
    const renderContent = () => (
      <>
        {renderUserInfo('incall')}
        <p>
          {__('Call duration:')} <b>{getSpentTime(timeSpent)}</b>
        </p>
        <InCallFooter>
          <Actions>
            <InnerActions>
              <div>
                <CallAction onClick={gotoDetail} $disabled={false}>
                  <Icon size={20} icon={'book-alt'} />
                </CallAction>

                {__('Detail')}
              </div>
            </InnerActions>
            <div>
              <CallAction onClick={endCall} $isDecline={true}>
                <Icon size={20} icon="phone-slash" />
              </CallAction>
              {__('End Call')}
            </div>
          </Actions>
        </InCallFooter>
      </>
    );

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
