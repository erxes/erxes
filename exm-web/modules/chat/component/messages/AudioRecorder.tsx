import React, { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Pause, Play } from "lucide-react"
import WaveSurfer from "wavesurfer.js"
import RecordPlugin from "wavesurfer.js/dist/plugins/record"

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

  useEffect(() => {
    if (!containerRef.current) {return}

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

    RecordPlugin.getAvailableAudioDevices().then((devices: any) =>
      setDeviceId(devices[0].deviceId)
    )

    const recordEffect = ws.registerPlugin(RecordPlugin.create())
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
        <div ref={containerRef} className="w-full "/>
      </div>
    </>
  )
}

export default AudioRecorder