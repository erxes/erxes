import * as React from "react";

import Call from "./Call";
import { useEffect } from "react";
import { usePeerConnection } from "./hooks/usePeerConnection";
import { useRoomContext } from "./RoomContext";

const CallContainer = () => {
  const { setIceConnectionState, setPeerConnection } = useRoomContext();
  const { peer, iceConnectionState } = usePeerConnection({
    iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
  });

  useEffect(() => {
    setPeerConnection(peer);
    setIceConnectionState(iceConnectionState);
  }, [peer, iceConnectionState]);

  return <Call />;
};

export default CallContainer;
