import * as React from 'react';
import { gql, useMutation, useSubscription } from '@apollo/client';
import { useEffect, useState } from 'react';

import AcceptedCallContainer from './AcceptedCallContainer';
import { CLOUDFLARE_CALL_RECEIVED } from '../../graphql/subscriptions';
import { CLOUDFLARE_LEAVE_CALL } from '../../graphql/mutations';
import { CloudflareCallDataDepartment } from '../../../types';
import Home from './Home';
import { getCallData } from '../../utils/util';
import { useRoomContext } from './RoomContext';
import { useRouter } from '../../context/Router';
import useUserMedia from './hooks/useUserMedia';

const CallContainer = () => {
  const { peer, pushedTracks } = useRoomContext();
  const { setRoute } = useRouter();

  const callData = getCallData();
  const { departments = [] } = callData;

  const [remoteAudioTracks, setRemoteAudioTracks] = useState([]) as any;
  const [departmentId, setDepartmentId] = useState(
    departments ? departments[0]._id : '',
  );

  const activeDepartment = departments.find(
    (department) => department._id === departmentId,
  ) as CloudflareCallDataDepartment;

  const { audioStreamTrack, stopAllTracks } = useUserMedia();

  const [leaveCall, { loading: loadingLeaveCall }] = useMutation(
    CLOUDFLARE_LEAVE_CALL,
    {
      onCompleted() {
        if (!peer) return;
        if (audioStreamTrack) {
          peer.closeTrack(audioStreamTrack);
          stopAllTracks();
        }

        setRemoteAudioTracks([]);
        setRoute('home');
      },
      onError(error) {
        setRemoteAudioTracks([]);
        console.log(error.message);
      },
    },
  );

  const { data: receiveCall } = useSubscription(gql(CLOUDFLARE_CALL_RECEIVED), {
    variables: { roomState: 'answered' },
    fetchPolicy: 'network-only', // Always fetch fresh data
  });

  const { data: leftCall } = useSubscription(gql(CLOUDFLARE_CALL_RECEIVED), {
    variables: { roomState: 'leave', audioTrack: pushedTracks?.audio },
    fetchPolicy: 'network-only',
  });

  const [callStartTime, setCallStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (
      receiveCall?.cloudflareReceivedCall?.audioTrack &&
      receiveCall?.cloudflareReceivedCall?.roomState !== 'leave' &&
      remoteAudioTracks.length === 0
    ) {
      setRemoteAudioTracks([receiveCall.cloudflareReceivedCall.audioTrack]);

      if (!callStartTime) {
        setCallStartTime(Date.now());
      }
    }
  }, [receiveCall]);

  useEffect(() => {
    if (leftCall?.cloudflareReceivedCall?.roomState === 'leave') {
      if (!peer) return;
      if (audioStreamTrack) {
        peer.closeTrack(audioStreamTrack);
        stopAllTracks();
      }
      setRemoteAudioTracks([]);
      setRoute('home');
    }
  }, [leftCall]);

  useEffect(() => {
    const handleRefresh = () => {
      if (!peer) return;
      if (audioStreamTrack) {
        peer.closeTrack(audioStreamTrack);
        stopAllTracks();
      }
      setRemoteAudioTracks([]);

      const duration = callStartTime
        ? Math.floor((Date.now() - callStartTime) / 1000)
        : 0;

      leaveCall({
        variables: {
          originator: 'web',
          duration,
          audioTrack: pushedTracks?.audio,
        },
      }).then(() => {});
    };

    window.addEventListener('beforeunload', handleRefresh);
    return () => {
      window.removeEventListener('beforeunload', handleRefresh);
    };
  }, [peer, audioStreamTrack, pushedTracks, callStartTime]);

  const stopCall = ({ seconds }: { seconds: number }) => {
    leaveCall({
      variables: {
        roomState: 'leave',
        originator: 'web',
        duration: seconds,
        audioTrack: pushedTracks?.audio,
      },
    }).then(() => {});
  };

  if (loadingLeaveCall) {
    return <div className="loader bigger" />;
  }

  return remoteAudioTracks && remoteAudioTracks.length > 0 ? (
    <AcceptedCallContainer
      stopCall={stopCall}
      remoteAudioTracks={remoteAudioTracks}
      activeDepartment={activeDepartment}
    />
  ) : (
    <Home
      stopCall={stopCall}
      audioStreamTrack={audioStreamTrack}
      setDepartmentId={setDepartmentId}
      departmentId={departmentId}
      departments={departments}
      activeDepartment={activeDepartment}
    />
  );
};

export type IHandleStopCall = (params: { seconds: number }) => void;

export default CallContainer;
