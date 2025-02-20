import * as React from "react";

import AcceptedCallComponent from "../../components/call/AcceptedCall";
import { PullAudioTracks } from "../../components/call/audio/AudioPulledTracks";

export type IHandleStopCall = (params: { seconds: number }) => void;

type IProps = {
  stopCall: IHandleStopCall;
  remoteAudioTracks: string[];
};

const AcceptedCallContainer = (props: IProps) => {
  const { stopCall } = props;

  const stop = (seconds: number) => {
    if (stopCall) {
      stopCall({ seconds });
    }
  };

  return (
    <PullAudioTracks audioTracks={props.remoteAudioTracks}>
      <AcceptedCallComponent stopCall={stop} />
    </PullAudioTracks>
  );
};

export default AcceptedCallContainer;
