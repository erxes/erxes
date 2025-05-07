import * as React from "react";

import { ReactNode, useState } from "react";
import RoomContext, { RoomContextType } from "./RoomContext";

type RoomProviderProps = {
  children: ReactNode;
};

export const RoomProvider = ({ children }: RoomProviderProps) => {
  const [pushedAudioTrack, setPushedAudioTrack] = useState("");
  const [peer, setPeerConnection] = useState() as any;
  const [iceConnectionState, setIceConnectionState] = useState() as any;

  const contextValue: RoomContextType = {
    peer: peer || null,
    iceConnectionState,
    pushedTracks: {
      audio: pushedAudioTrack,
    },
    setPushedAudioTrack,
    setPeerConnection,
    setIceConnectionState,
  };

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};
