import React, { FC, ReactNode } from 'react';

import { createContext, useContext } from 'react';
import { AudioStream } from './AudioStream';
import usePulledTracks from './hooks/usePulledTracks';

interface PullAudioTracksProps {
  audioTracks: string[];
  children?: ReactNode;
}

const AudioTrackContext = createContext<Record<string, MediaStreamTrack>>({});

export const PullAudioTracks: FC<PullAudioTracksProps> = ({
  audioTracks,
  children,
}) => {
  const audioTrackMap = usePulledTracks(audioTracks);
  return (
    <AudioTrackContext.Provider value={audioTrackMap}>
      {Object.entries(audioTrackMap).map(([trackKey, mediaStreamTrack]) => (
        <AudioStream key={trackKey} mediaStreamTrack={mediaStreamTrack} />
      ))}
      {children}
    </AudioTrackContext.Provider>
  );
};

export function usePulledAudioTracks() {
  return useContext(AudioTrackContext);
}

export function usePulledAudioTrack(track?: string) {
  const tracks = usePulledAudioTracks();
  return track ? tracks[track] : undefined;
}
