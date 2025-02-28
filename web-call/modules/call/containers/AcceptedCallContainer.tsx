import React from "react"

import { PullAudioTracks } from "@/components/audio/AudioPulledTracks"

import AcceptedCallComponent from "../components/AcceptedCall"
import { IHandleStopCall } from "./Call"

type IProps = {
  stopCall: IHandleStopCall
  remoteAudioTracks: string[]
}
const AcceptedCallContainer = (props: IProps) => {
  const { stopCall } = props

  const stop = (seconds: number) => {
    if (stopCall) {
      stopCall({ seconds })
    }
  }

  return (
    <PullAudioTracks audioTracks={props.remoteAudioTracks}>
      <AcceptedCallComponent stopCall={stop} />
    </PullAudioTracks>
  )
}

export default AcceptedCallContainer
