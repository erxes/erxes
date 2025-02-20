import * as React from "react";

import { gql, useMutation, useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";

import AcceptedCallContainer from "./AcceptedCallContainer";
import { CLOUDFLARE_CALL_RECEIVED } from "../../graphql/subscriptions";
import { CLOUDFLARE_LEAVE_CALL } from "../../graphql/mutations";
import Home from "./Home";
import { useRoomContext } from "./RoomContext";
import { useRouter } from "../../context/Router";
import useUserMedia from "./hooks/useUserMedia";

const CallContainer = () => {
  const { peer, pushedTracks } = useRoomContext();
  const { setRoute } = useRouter();

  const [remoteAudioTracks, setRemoteAudioTracks] = useState([]) as any;

  const { audioStreamTrack, stopAllTracks } = useUserMedia();

  const [leaveCall, { loading: loadingLeaveCall }] = useMutation(
    CLOUDFLARE_LEAVE_CALL,
    {
      onCompleted() {
        if (!peer) return;
        if (audioStreamTrack) {
          peer.closeTrack(audioStreamTrack);
          stopAllTracks();
        }

        setRemoteAudioTracks([]);
        setRoute("home");
      },
      onError(error) {
        setRemoteAudioTracks([]);

        // return Alert.error(error.message)
        return console.log(error.message);
      },
    }
  );
  const { data: receiveCall } = useSubscription(gql(CLOUDFLARE_CALL_RECEIVED), {
    variables: {
      roomState: "answered",
    },
  });

  const { data: leftCall } = useSubscription(gql(CLOUDFLARE_CALL_RECEIVED), {
    variables: {
      roomState: "leave",
    },
  });

  useEffect(() => {
    if (
      receiveCall?.cloudflareReceivedCall?.audioTrack &&
      receiveCall?.cloudflareReceivedCall?.roomState !== "leave"
    ) {
      const track = [receiveCall.cloudflareReceivedCall.audioTrack] || [];
      setRemoteAudioTracks(track);
    }
  }, [receiveCall]);

  useEffect(() => {
    if (leftCall?.cloudflareReceivedCall?.roomState === "leave") {
      if (!peer) return;
      if (audioStreamTrack) {
        peer.closeTrack(audioStreamTrack);
        stopAllTracks();
      }
      setRemoteAudioTracks([]);
      setRoute("home");
    }
  }, [leftCall]);

  const stopCall = ({ seconds }: { seconds: number }) => {
    leaveCall({
      variables: {
        roomState: "leave",
        originator: "web",
        duration: seconds,
        audioTrack: pushedTracks?.audio,
      },
    });
  };

  if (loadingLeaveCall) {
    return <div>Loading..</div>;
  }

  return remoteAudioTracks && remoteAudioTracks.length > 0 ? (
    <AcceptedCallContainer
      stopCall={stopCall}
      remoteAudioTracks={remoteAudioTracks}
    />
  ) : (
    <Home stopCall={stopCall} audioStreamTrack={audioStreamTrack} />
  );
};

export type IHandleCall = (params: { integrationId: string }) => void;

export type IHandleStopCall = (params: { seconds: number }) => void;

export default CallContainer;
