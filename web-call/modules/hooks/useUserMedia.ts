import { useEffect, useRef, useState } from "react"
import { useUnmount } from "react-use"
import invariant from "tiny-invariant"

import { getUserMediaExtended } from "../utils/getUserMedia"
import keyInObject from "../utils/keyInObject"

export const errorMessageMap = {
  NotAllowedError:
    "Permission was denied. Grant permission and reload to enable.",
  NotFoundError: "No device was found.",
  NotReadableError: "Device is already in use.",
  OverconstrainedError: "No device was found that meets constraints",
}

export default function useUserMedia() {
  const [audioStreamTrack, setAudioStreamTrack] =
    useState<MediaStreamTrack | null>(null)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const streamRef = useRef<MediaStream | null>(null)

  const initMedia = async (mounted: boolean) => {
    try {
      if (streamRef.current) {
        // If already initialized, reuse the stream
        const audioTrack = streamRef.current.getAudioTracks()[0]
        if (mounted) {
          setAudioStreamTrack(audioTrack)
          audioTrack.enabled = audioEnabled
        }
        return
      }

      const stream = await getUserMediaExtended({ audio: true })
      if (!mounted) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }

      streamRef.current = stream // Cache the stream
      const audioTrack = stream.getAudioTracks()[0]
      if (mounted) {
        setAudioStreamTrack(audioTrack)
        audioTrack.enabled = audioEnabled
      }
    } catch (e: any) {
      console.error("Error accessing media devices:", e)
      if (!mounted) return
      setAudioEnabled(false)
      if (keyInObject(errorMessageMap, e.name)) {
        invariant(keyInObject(errorMessageMap, e.name))
      }
    }
  }

  const stopAllTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setAudioStreamTrack(null)
      initMedia(true)
    }
  }
  const turnMicOff = () => {
    if (audioStreamTrack) {
      audioStreamTrack.enabled = false
    }
    setAudioEnabled(false)
  }

  const turnMicOn = () => {
    if (audioStreamTrack) {
      audioStreamTrack.enabled = true
    }
    setAudioEnabled(true)
  }

  useEffect(() => {
    let mounted = true
    initMedia(mounted)

    return () => {
      mounted = false
      // Clean up the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [audioEnabled])

  useUnmount(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  })

  return {
    turnMicOn,
    turnMicOff,
    stopAllTracks,
    audioStreamTrack,
    audioEnabled,
  }
}

export type UserMedia = ReturnType<typeof useUserMedia>
