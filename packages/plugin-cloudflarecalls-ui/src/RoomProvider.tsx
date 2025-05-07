import React, { ReactNode, useState } from 'react';

import RoomContext, { RoomContextType } from './RoomContext';
import { usePeerConnection } from './components/hooks/usePeerConnection';

type RoomProviderProps = {
  children: ReactNode;
};

export const RoomProvider = ({ children }: RoomProviderProps) => {
  const [pushedAudioTrack, setPushedAudioTrack] = useState('');

  const { peer, iceConnectionState, setIceConnectionState } = usePeerConnection(
    {
      iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }],
    },
  );

  const contextValue: RoomContextType = {
    peer: peer || null,
    iceConnectionState,
    pushedTracks: {
      audio: pushedAudioTrack,
    },
    setPushedAudioTrack,
    setIceConnectionState,
  };

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};
