import * as React from "react";

import { CLOUDFLARE_CALL } from "../../graphql/mutations";
import Call from "../../components/call/Call";
import { IHandleStopCall } from "./Call";
import RingingCallComponent from "../../components/call/RingingCall";
import RouteChooser from "./RouteChooser";
import { getCallData } from "../../utils/util";
import { useMutation } from "@apollo/client";
import { useRoomContext } from "./RoomContext";
import { useRouter } from "../../context/Router";
import { useState } from "react";

type IProps = {
  stopCall: IHandleStopCall;
  audioStreamTrack: any;
};

const HomeContainer = (props: IProps) => {
  const callData = getCallData();
  const { departments = [] } = callData;

  const { pushedTracks } = useRoomContext();
  const { stopCall } = props;
  const [isCalling, setIsCalling] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState(
    departments ? departments[0]._id : ""
  );

  const { setRoute } = useRouter();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const onSubmit = () => {
    setIsSubmitted(true);
  };

  const onButtonClick = () => {
    setRoute("home");
  };

  const [call, { loading }] = useMutation(CLOUDFLARE_CALL, {
    onCompleted() {},
    onError(error) {
      setIsRinging(false);
      setPhoneNumber("");
      //   return Alert.error(error.message)
    },
  });

  const handleCall = () => {
    setIsRinging(true);
    // console.log("integrationId", integrationId);
    call({
      variables: {
        integrationId: "4SxJ9drjH_yucWcDApUHT",
        callerNumber: phoneNumber,
        callerEmail: email,
        audioTrack: pushedTracks?.audio,
        roomState: "ready",
        departmentId,
      },
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return isRinging ? (
    <RingingCallComponent stopCall={stopCall} />
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
      isSubmitted={isSubmitted}
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
