import * as React from "react";

import { CloudflareCallDataDepartment } from "../../../types";
import RouteChooser from "../../components/call/RouteChooser";
import { useEffect } from "react";
import usePushedTrack from "./hooks/usePushedTrack";
import { useRoomContext } from "./RoomContext";

type IProps = {
  call: () => void;
  audioStreamTrack: any;
  onBack: (isCalling: boolean) => void;
  setDepartmentId: (departmentId: string) => void;
  departments: CloudflareCallDataDepartment[];
  departmentId: string;
};

const RouteChooserContainer = ({
  call,
  audioStreamTrack,
  onBack,
  departments,
  departmentId,
  setDepartmentId,
}: IProps) => {
  const { peer, setPushedAudioTrack } = useRoomContext();
  const pushedAudioTrack =
    peer &&
    audioStreamTrack &&
    usePushedTrack(peer, audioStreamTrack, {
      priority: "high",
    });
  useEffect(() => {
    if (pushedAudioTrack) {
      setPushedAudioTrack(pushedAudioTrack);
    }
  }, [pushedAudioTrack]);

  const makeCall = () => {
    if (call && pushedAudioTrack) {
      call();
    } else {
      console.error("Failed to make call: No pushed audio track available");
    }
  };

  return (
    <RouteChooser
      call={makeCall}
      onBack={onBack}
      departments={departments}
      departmentId={departmentId}
      setDepartmentId={setDepartmentId}
    />
  );
};

export type IStopCall = () => void;

export type IHandleForgotPassword = (params: { email: string }) => void;

export default RouteChooserContainer;
