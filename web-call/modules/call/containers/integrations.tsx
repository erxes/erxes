import React, { useEffect } from "react"
import { useRoomContext } from "@/modules/RoomContext"
import usePushedTrack from "@/modules/hooks/usePushedTrack"
import { useQuery } from "@apollo/client"
import { Loader } from "lucide-react"

import Integrations from "../components/integrations"
import { queries } from "../graphql"
import { IHandleCall } from "./Call"

type IProps = {
  call: IHandleCall
  audioStreamTrack: any
}

const IntegrationsContainer = (props: IProps) => {
  const { call, audioStreamTrack } = props
  const { data, loading } = useQuery(queries.integrations, {
    variables: {
      kind: "cloudflarecalls",
    },
  })

  const { peer, setPushedAudioTrack } = useRoomContext()
  const pushedAudioTrack =
    peer &&
    audioStreamTrack &&
    usePushedTrack(peer, audioStreamTrack, {
      priority: "high",
    })
  useEffect(() => {
    if (pushedAudioTrack) {
      setPushedAudioTrack(pushedAudioTrack)
    }
  }, [pushedAudioTrack])

  const makeCall = ({ integrationId }: { integrationId: string }) => {
    if (call && pushedAudioTrack) {
      call({ integrationId })
    } else {
      console.error("Failed to make call: No pushed audio track available")
    }
  }

  if (loading) {
    return <Loader />
  }

  const integrations = data.cloudflareCallsGetIntegrations
  return (
    <Integrations
      loading={loading}
      integrations={integrations}
      call={makeCall}
    />
  )
}

export type IStopCall = () => void

export type IHandleForgotPassword = (params: { email: string }) => void

export default IntegrationsContainer
