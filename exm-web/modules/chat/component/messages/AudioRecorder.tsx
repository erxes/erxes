import React, { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Pause, Play } from "lucide-react"
import WaveSurfer from "wavesurfer.js"
import RecordPlugin from "wavesurfer.js/dist/plugins/record"

import { toast } from "@/components/ui/use-toast"

type Props = {
  sendAudio: (blob: Blob) => void
}

const AudioRecorder = ({ sendAudio }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined)

  const [wavesurfer, setWavesurfer] = useState<any>(null)
  const [record, setRecord] = useState<any>(null)

  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  const [recordTime, setRecordTime] = useState(0)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const formattedMinutes = String(minutes).padStart(2, "0")
    const formattedSeconds = String(remainingSeconds).padStart(2, "0")
    return `${formattedMinutes}:${formattedSeconds}`
  }

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgb(100, 0, 100)",
      cursorWidth: 0,
      barWidth: 2,
      barGap: 2,
      barRadius: 4,
      height: 21,
      dragToSeek: true,
    })

    setWavesurfer(ws)

    RecordPlugin.getAvailableAudioDevices()
      .then((devices: any) => setDeviceId(devices[0].deviceId))
      .catch((e) => {
        setIsRecording(false)
        toast({
          title: "Accessing the microphone",
          description: "Requested device not found",
          variant: "warning",
        })
      })

    const recordEffect = ws.registerPlugin(
      RecordPlugin.create({
        // scrollingWaveform: true,
        // renderRecordedAudio : true
      })
    )
    setRecord(recordEffect)

    recordEffect.on("record-end", (blob: any) => {
      sendAudio(blob)
    })

    recordEffect.startRecording({ deviceId })
    setIsRecording(true)

    return () => {
      ws.destroy()
    }
  }, [])

  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (isRecording && !isPaused) {
        if (recordTime >= 59) {
          record.stopRecording()
          record.stopMic()
          setIsRecording(false)
          clearInterval(timerInterval)
        } else {
          setRecordTime((prevTime) => prevTime + 1)
        }
      }
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [isRecording, isPaused, recordTime])

  const startRecording = () => {
    record.startRecording({ deviceId })
    setIsRecording(true)
  }

  const stopRecording = () => {
    record.stopRecording()
    record.stopMic()
    setIsRecording(false)
  }

  const pauseRecording = () => {
    record.pauseRecording()

    setIsPaused(true)
  }
  const resumeRecording = () => {
    record.resumeRecording()

    setIsPaused(false)
  }

  return (
    <>
      <div className="flex gap-4">
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <button onClick={isPaused ? resumeRecording : pauseRecording}>
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>
      </div>

      <div className="flex w-full items-center gap-4 p-5 rounded-lg bg-[#F5FAFF] drop-shadow-md">
        <div className=" w-1/12 text-center text-[14px] text-semibold">
          {formatTime(recordTime)}
        </div>
        <div ref={containerRef} className="w-full " />
      </div>
    </>
  )
}

export default AudioRecorder
