import { useEffect, useMemo, useRef, useState } from "react"

import Peer from "../utils/peerClient"

export function useStablePojo<T>(value: T): T {
  const jsonString = JSON.stringify(value)
  return useMemo(() => JSON.parse(jsonString), [jsonString])
}

export const usePeerConnection = (config: { iceServers?: RTCIceServer[] }) => {
  const peerRef = useRef<Peer>()
  const stableConfig = useStablePojo(config)

  const [iceConnectionState, setIceConnectionState] =
    useState<RTCIceConnectionState>("new")

  useEffect(() => {
    const p = new Peer(stableConfig)
    peerRef.current = p

    const iceConnectionStateChangeHandler = () => {
      setIceConnectionState(p.pc.iceConnectionState)
    }
    p.pc.addEventListener(
      "iceconnectionstatechange",
      iceConnectionStateChangeHandler
    )
    return () => {
      p.pc.removeEventListener(
        "connectionstatechange",
        iceConnectionStateChangeHandler
      )
      peerRef.current?.destroy()
    }
  }, [stableConfig])

  return { peer: peerRef.current, iceConnectionState }
}
