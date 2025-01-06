import React, { useState } from "react"
import { useRoomContext } from "@/modules/RoomContext"
import Alert from "@/modules/utils/Alert"
import { useMutation } from "@apollo/client"
import { Loader } from "lucide-react"

import Call from "../components/Call"
import { mutations } from "../graphql"
import { IHandleCall, IHandleStopCall } from "./Call"
import RingingCallContainer from "./RingingCall"
import IntegrationsContainer from "./integrations"

type IProps = {
  stopCall: IHandleStopCall
  audioStreamTrack: any
}
const HomeContainer = (props: IProps) => {
  const { pushedTracks } = useRoomContext()
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
        integrationId,
        callerNumber: phoneNumber,
        audioTrack: pushedTracks?.audio,
        roomState: "ready",
      },
    })
  }

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
