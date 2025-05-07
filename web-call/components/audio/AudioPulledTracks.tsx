import React, {
  createContext,
  useContext,
  type FC,
  type ReactNode,
} from "react"
import usePulledTracks from "@/modules/hooks/usePulledTracks"

import { AudioStream } from "./AudioTracks"

interface PullAudioTracksProps {
  audioTracks: string[]
  children?: ReactNode
}

const AudioTrackContext = createContext<Record<string, MediaStreamTrack>>({})

export const PullAudioTracks: FC<PullAudioTracksProps> = ({
  audioTracks,
  children,
}) => {
  const audioTrackMap = usePulledTracks(audioTracks)
  return (
    <AudioTrackContext.Provider value={audioTrackMap}>
      {Object.entries(audioTrackMap).map(([trackKey, mediaStreamTrack]) => (
        <AudioStream key={trackKey} mediaStreamTrack={mediaStreamTrack} />
      ))}
      {children}
    </AudioTrackContext.Provider>
  )
}

export function usePulledAudioTracks() {
  return useContext(AudioTrackContext)
}

export function usePulledAudioTrack(track?: string) {
  const tracks = usePulledAudioTracks()
  return track ? tracks[track] : undefined
}
