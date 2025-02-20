import { IHandleCall, IHandleStopCall } from "./Call"
import React, { useEffect, useState } from "react"

import Alert from "@/modules/utils/Alert"
import Call from "../components/Call"
import IntegrationsContainer from "./integrations"
import { Loader } from "lucide-react"
import RingingCallContainer from "./RingingCall"
import { mutations } from "../graphql"
import { useMutation } from "@apollo/client"
import usePushedTrack from "@/modules/hooks/usePushedTrack"
import { useRoomContext } from "@/modules/RoomContext"

type IProps = {
  stopCall: IHandleStopCall
  audioStreamTrack: any
}
const HomeContainer = (props: IProps) => {
  const { pushedTracks, peer, setPushedAudioTrack } = useRoomContext()
  const { stopCall } = props
  const [isRinging, setIsRinging] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")

  const [call, { loading }] = useMutation(mutations.call, {
    onCompleted() {},
    onError(error) {
      setIsRinging(false)
      setPhoneNumber("")
      return Alert.error(error.message)
    },
  })

  const handleCall: IHandleCall = ({ integrationId }) => {
    setIsRinging(true)

    call({
      variables: {
        integrationId: "4SxJ9drjH_yucWcDApUHT",
        callerNumber: phoneNumber,
        audioTrack: pushedTracks?.audio,
        roomState: "ready",
        departmentId: "67b30a294c046b44347df2d4",
      },
    })
  }

  let pushedAudioTrack = "aa" as any

  useEffect(() => {
    if (peer && props.audioStreamTrack) {
      setTimeout(() => {
        console.log("hi")
        pushedAudioTrack = usePushedTrack(peer, props.audioStreamTrack, {
          priority: "high",
        })
        console.log("bye")
      }, 5000) // Delay for 30 seconds
    }
  }, [peer, props.audioStreamTrack])
  console.log("kkkk", pushedAudioTrack)

  if (loading) {
    return <Loader />
  }

  return isRinging ? (
    <RingingCallContainer stopCall={stopCall} />
  ) : phoneNumber ? (
    <IntegrationsContainer
      call={handleCall}
      audioStreamTrack={props.audioStreamTrack}
    />
  ) : (
    <Call loading={loading} setPhoneNumber={setPhoneNumber} />
  )
}

export default HomeContainer
