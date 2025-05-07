import * as React from "react";

import AcceptedCallComponent from "../../components/call/AcceptedCall";
import { CloudflareCallDataDepartment } from "../../../types";
import { PullAudioTracks } from "../../components/call/audio/AudioPulledTracks";

export type IHandleStopCall = (params: { seconds: number }) => void;

type IProps = {
  stopCall: IHandleStopCall;
  remoteAudioTracks: string[];
  activeDepartment: CloudflareCallDataDepartment;
};

const AcceptedCallContainer = (props: IProps) => {
  const { stopCall, activeDepartment, remoteAudioTracks } = props;

  const stop = (seconds: number) => {
    if (stopCall) {
      stopCall({ seconds });
    }
  };

  return (
    <PullAudioTracks audioTracks={remoteAudioTracks}>
      <AcceptedCallComponent
        stopCall={stop}
        activeDepartment={activeDepartment}
      />
    </PullAudioTracks>
  );
};

export default AcceptedCallContainer;
