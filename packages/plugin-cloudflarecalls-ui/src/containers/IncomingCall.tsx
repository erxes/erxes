import React, { useEffect, useState } from 'react';
import { gql, useMutation, useSubscription } from '@apollo/client';

import { Alert } from '@erxes/ui/src/utils';
import { ICustomer } from '../types';
import IncomingCall from '../components/IncomingCall';
import { __ } from '@erxes/ui/src/utils/core';
import { mutations, subscriptions } from '../graphql';
import { useRoomContext } from '../RoomContext';

import useUserMedia from '../components/hooks/useUserMedia';
import usePushedTrack from '../components/hooks/usePushedTrack';
interface IProps {
  closeModal?: () => void;
  callUserIntegrations: any;
  hideIncomingCall?: boolean;
  setIsCallReceive?: (isHide: boolean) => void;
  currentCallConversationId: string;
  phoneNumber: string;
  audioTrack?: string;
}

const IncomingCallContainer = (props: IProps) => {
  const [customer] = useState<any>({} as ICustomer);
  const [channels] = useState<any>();
  const context = useRoomContext();

  const [hasMicrophone, setHasMicrophone] = useState(false);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);

  const {
    callUserIntegrations,
    currentCallConversationId,
    phoneNumber,
    audioTrack,
    setIsCallReceive,
  } = props;

  const defaultCallIntegration =
    localStorage.getItem('config:call_integrations') || '{}';
  const erxesApiId =
    JSON.parse(defaultCallIntegration)?.erxesApiId ||
    callUserIntegrations?.[0]?.erxesApiId;

  const [answerCallMutation] = useMutation(gql(mutations.cloudflareAnswerCall));
  const [stopCallMutation] = useMutation(gql(mutations.cloudflareLeaveCall));

  const userMedia = useUserMedia();

  const answerCall = () => {
    setCallStartTime(Date.now()); // Store the timestamp when the call starts

    answerCallMutation({
      variables: {
        roomState: 'answered',
        audioTrack: context.pushedTracks?.audio,
        customerAudioTrack: audioTrack,
      },
    })
      .then(() => {})
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const stopCall = () => {
    const endTime = Date.now();
    const duration = callStartTime
      ? Math.floor((endTime - callStartTime) / 1000)
      : 0;

    stopCallMutation({
      variables: {
        roomState: 'leave',
        originator: 'erxes',
        audioTrack,
        duration,
      },
    })
      .then(() => {
        if (!context || !context?.peer) return;
        if (userMedia?.audioStreamTrack) {
          context.peer.closeTrack(userMedia?.audioStreamTrack);
        }
        if (setIsCallReceive) setIsCallReceive(false);
        setPushedAudioTrack('');
        context.setIceConnectionState('closed');
      })
      .catch((e) => {
        Alert.error(e.message);
      });

    setCallStartTime(null);
  };

  const { data: leaveCall } = useSubscription(
    gql(subscriptions.webCallReceived),
    {
      variables: { roomState: 'leave', audioTrack },
      fetchPolicy: 'network-only',
    },
  );

  const { peer, setPushedAudioTrack } = useRoomContext();

  const pushedAudioTrack =
    peer &&
    usePushedTrack(peer, userMedia.audioStreamTrack, {
      priority: 'high',
    });

  useEffect(() => {
    if (pushedAudioTrack) {
      setPushedAudioTrack(pushedAudioTrack);
    }
  }, [pushedAudioTrack]);

  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then(() => {
        setHasMicrophone(true);
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
        const errorMessage = error
          ?.toString()
          .replace('DOMException:', '')
          .replace('NotFoundError: ', '');
        setHasMicrophone(false);
        Alert.error(errorMessage);
      });
  }, [phoneNumber]);

  useEffect(() => {
    if (leaveCall?.cloudflareReceiveCall && audioTrack) {
      if (!context?.peer) return;

      if (userMedia?.audioStreamTrack) {
        context.peer.closeTrack(userMedia.audioStreamTrack);
      }

      setIsCallReceive?.(false);
      setPushedAudioTrack('');
    }
  }, [leaveCall, context, userMedia?.audioStreamTrack, setIsCallReceive]);

  useEffect(() => {
    const handleRefresh = (event: BeforeUnloadEvent) => {
      if (!context?.peer) return;

      stopCall();

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleRefresh);
    return () => {
      window.removeEventListener('beforeunload', handleRefresh);
    };
  }, [context, stopCall]);

  return (
    <IncomingCall
      leaveCall={stopCall}
      answerCall={answerCall}
      customer={customer}
      channels={channels}
      hasMicrophone={hasMicrophone}
      phoneNumber={phoneNumber}
      hideIncomingCall={props.hideIncomingCall}
      erxesApiId={erxesApiId}
      currentCallConversationId={currentCallConversationId}
      audioTrack={audioTrack}
    />
  );
};

export default IncomingCallContainer;
