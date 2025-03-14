import React from "react"
import { useRoomContext } from "@/modules/RoomContext"
import { useConditionForAtLeast } from "@/modules/hooks/useConditionForAtLeast"

export function IceDisconnectedToast() {
  const { iceConnectionState } = useRoomContext()

  const disconnectedForAtLeastTwoSeconds = useConditionForAtLeast(
    iceConnectionState === "disconnected",
    2000
  )
  console.log(
    disconnectedForAtLeastTwoSeconds,
    "disconnectedForAtLeastTwoSeconds"
  )
  if (!disconnectedForAtLeastTwoSeconds) {
    return null
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="font-bold">ICE disconnected</div>
    </div>
  )
}
