"use client"

import { useEffect } from "react"
import { useRoomContext } from "@/modules/RoomContext"
import CallContainer from "@/modules/call/containers/Call"
import { usePeerConnection } from "@/modules/hooks/usePeerConnection"

const Call = () => {
  const { setIceConnectionState, setPeerConnection } = useRoomContext()
  const { peer, iceConnectionState } = usePeerConnection({
    iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
  })

  useEffect(() => {
    setPeerConnection(peer)
    setIceConnectionState(iceConnectionState)
  }, [peer, iceConnectionState])
  return <CallContainer />
}

export default Call
