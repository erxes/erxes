import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useRoomContext } from "@/modules/RoomContext"
import useUserMedia from "@/modules/hooks/useUserMedia"
import Alert from "@/modules/utils/Alert"
import { gql, useMutation, useSubscription } from "@apollo/client"
import { Loader } from "lucide-react"

import { mutations, subscriptions } from "../graphql"
import AcceptedCallContainer from "./AcceptedCallContainer"
import HomeContainer from "./Home"

const CallContainer = () => {
  const { peer, pushedTracks } = useRoomContext()
  const router = useRouter()

  const [remoteAudioTracks, setRemoteAudioTracks] = useState([]) as any

  const { audioStreamTrack, stopAllTracks } = useUserMedia()

  const [leaveCall, { loading: loadingLeaveCall }] = useMutation(
    mutations.leaveCall,
    {
      onCompleted() {
        if (!peer) return
        if (audioStreamTrack) {
          peer.closeTrack(audioStreamTrack)
          stopAllTracks()
        }

        setRemoteAudioTracks([])
        router.push("/")
      },
      onError(error) {
        setRemoteAudioTracks([])

        return Alert.error(error.message)
      },
    }
  )
  const { data: receiveCall } = useSubscription(
    gql(subscriptions.webCallReceived),
    {
      variables: {
        roomState: "answered",
      },
    }
  )

  const { data: leftCall } = useSubscription(
    gql(subscriptions.webCallReceived),
    {
      variables: {
        roomState: "leave",
      },
    }
  )

  useEffect(() => {
    if (
      receiveCall?.cloudflareReceivedCall?.audioTrack &&
      receiveCall?.cloudflareReceivedCall?.roomState !== "leave"
    ) {
      const track = [receiveCall.cloudflareReceivedCall.audioTrack] || []
      setRemoteAudioTracks(track)
    }
  }, [receiveCall])
  useEffect(() => {
    if (leftCall?.cloudflareReceivedCall?.roomState === "leave") {
      if (!peer) return
      if (audioStreamTrack) {
        peer.closeTrack(audioStreamTrack)
        stopAllTracks()
      }
      setRemoteAudioTracks([])
      router.push("/")
    }
  }, [leftCall])

  const stopCall = ({ seconds }: { seconds: number }) => {
    leaveCall({
      variables: {
        roomState: "leave",
        originator: "web",
        duration: seconds,
        audioTrack: pushedTracks?.audio,
      },
    })
  }

  if (loadingLeaveCall) {
    return <Loader />
  }

  return (
    <div className="flex h-screen items-center justify-center bg-neutral-150 p-10">
      <div className="h-full w-full grid bg-white">
        <div className="flex justify-center items-center flex-col relative">
          <div style={{ width: "20%" }}>
            {remoteAudioTracks && remoteAudioTracks.length > 0 ? (
              <AcceptedCallContainer
                stopCall={stopCall}
                remoteAudioTracks={remoteAudioTracks}
              />
            ) : (
              <HomeContainer
                stopCall={stopCall}
                audioStreamTrack={audioStreamTrack}
              />
            )}
          </div>

          <div className="flex justify-center absolute bottom-[20px]">
            <span className="text-[#A0AEC0] text-xs">
              @ 2024, Made with ❤️ by{" "}
              <b className="text-[#6569DF]">erxes Team</b>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
export type IHandleCall = (params: { integrationId: string }) => void

export type IHandleStopCall = (params: { seconds: number }) => void

export default CallContainer
