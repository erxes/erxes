import * as React from "react";

import { CLOUDFLARE_CALL } from "../../graphql/mutations";
import Call from "../../components/call/Call";
import { CloudflareCallDataDepartment } from "../../../types";
import { IHandleStopCall } from "./Call";
import RingingCallComponent from "../../components/call/RingingCall";
import RouteChooser from "./RouteChooser";
import { getIntegrationId } from "../../utils/util";
import { useMutation } from "@apollo/client";
import { useRoomContext } from "./RoomContext";
import { useState } from "react";

type IProps = {
  stopCall: IHandleStopCall;
  audioStreamTrack: any;
  setDepartmentId: (departmentId: string) => void;
  departments: CloudflareCallDataDepartment[];
  activeDepartment: CloudflareCallDataDepartment;
  departmentId: string;
};

const HomeContainer = (props: IProps) => {
  const { pushedTracks } = useRoomContext();
  const integrationId = getIntegrationId();

  const {
    stopCall,
    setDepartmentId,
    activeDepartment,
    departmentId,
    departments,
  } = props;

  const [isCalling, setIsCalling] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const [call, { loading }] = useMutation(CLOUDFLARE_CALL, {
    onCompleted() {},
    onError(error) {
      setIsRinging(false);
      setPhoneNumber("");
      // return Alert.error(error.message)
    },
  });

  const handleCall = () => {
    setIsRinging(true);

    call({
      variables: {
        integrationId,
        callerNumber: phoneNumber,
        callerEmail: email,
        audioTrack: pushedTracks?.audio,
        roomState: "ready",
        departmentId,
      },
    });
  };

  if (loading) {
    return <div className="loader bigger" />;
  }

  return isRinging ? (
    <RingingCallComponent
      activeDepartment={activeDepartment}
      stopCall={stopCall}
      onBack={setIsCalling}
    />
  ) : isCalling ? (
    <RouteChooser
      call={handleCall}
      audioStreamTrack={props.audioStreamTrack}
      departments={departments}
      setDepartmentId={setDepartmentId}
      onBack={setIsCalling}
      departmentId={departmentId}
    />
  ) : (
    <Call
      setPhoneNumber={setPhoneNumber}
      phoneNumber={phoneNumber}
      email={email}
      setEmail={setEmail}
      setIsCalling={setIsCalling}
      audioStreamTrack={props.audioStreamTrack}
    />
  );
};

export default HomeContainer;
