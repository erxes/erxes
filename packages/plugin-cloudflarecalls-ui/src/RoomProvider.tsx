import React, { ReactNode, useState } from 'react';

import RoomContext, { RoomContextType } from './RoomContext';
import { usePeerConnection } from './components/hooks/usePeerConnection';

type RoomProviderProps = {
  children: ReactNode;
};

export const RoomProvider = ({ children }: RoomProviderProps) => {
  const [pushedAudioTrack, setPushedAudioTrack] = useState('');
  const { peer, iceConnectionState } = usePeerConnection({
    iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }],
  });
  const contextValue: RoomContextType = {
    peer: peer || null,
    iceConnectionState,
    pushedTracks: {
      audio: pushedAudioTrack,
    },
    setPushedAudioTrack,
  };

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};
