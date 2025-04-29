import { createContext, useContext } from 'react';
import Peer from './components/utils/peerClient';

export type RoomContextType = {
  peer: Peer | null;
  iceConnectionState: RTCIceConnectionState;
  pushedTracks?: {
    audio?: string;
  };
  setPushedAudioTrack: (newValue: string) => void;
  setIceConnectionState: (newValue: any) => void;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoomContext = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
};
export default RoomContext;
