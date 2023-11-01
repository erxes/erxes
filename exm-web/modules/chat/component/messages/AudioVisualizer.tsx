import React, { memo, useCallback, useEffect, useRef, useState } from "react"
import { Pause, Play, Volume2, VolumeX } from "lucide-react"
import WaveSurfer from "wavesurfer.js"

type Props = {
  waveColor: string
  progressColor: string
  url: string
  from?: string
}

const useWavesurfer = (containerRef: any, options: any) => {
  const [wavesurfer, setWavesurfer] = useState<any>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const ws = WaveSurfer.create({
      ...options,
      container: containerRef.current,
      cursorWidth: 0,
      barWidth: 2,
      barGap: 2,
      barRadius: 4,
      height: 21,
      dragToSeek: true,
    })

    setWavesurfer(ws)

    return () => {
      ws.destroy()
    }
  }, [options, containerRef])

  return wavesurfer
}

const AudioVisualizer = (props: Props) => {
  const containerRef = useRef<any>()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState("0:00")
  const wavesurfer = useWavesurfer(containerRef, props)

  const formatTime = (time: number) => {
    return [
      Math.floor((time % 3600) / 60),
      ("00" + Math.floor(time % 60)).slice(-2),
    ].join(":")
  }

  const onPlayToggle = useCallback(() => {
    wavesurfer.isPlaying() ? wavesurfer.pause() : wavesurfer.play()
  }, [wavesurfer])

  const onMuteToggle = useCallback(() => {
    setIsMuted(!wavesurfer.getMuted())
    wavesurfer.setMuted(!wavesurfer.getMuted())
  }, [wavesurfer])

  useEffect(() => {
    if (!wavesurfer) {
      return
    }

    setCurrentTime("0:00")
    setIsPlaying(false)

    const subscriptions = [
      wavesurfer.on("play", () => setIsPlaying(true)),
      wavesurfer.on("pause", () => setIsPlaying(false)),
      wavesurfer.on("timeupdate", (currentTimeSub: any) =>
        setCurrentTime(formatTime(currentTimeSub))
      ),
      wavesurfer.on("ready", () => {
        const duration = wavesurfer.getDuration()

        setCurrentTime(formatTime(duration))
        
        if (containerRef.current && props.from === "message") {
          const minDuration = 2.0
          const maxDuration = 59.99

          const minWidth = 50
          const maxWidth = 100

          const width =
            ((duration - minDuration) / (maxDuration - minDuration)) *
              (maxWidth - minWidth) +
            minWidth

          const clampedWidth = Math.min(maxWidth, Math.max(minWidth, width))

          containerRef.current.style.width = `${clampedWidth}px`
        } else {
          containerRef.current.style.width = `100%`
        }
      }),
    ]

    return () => {
      subscriptions.forEach((unsub) => unsub())
    }
  }, [wavesurfer])

  return (
    <div className="relative flex gap-2 items-center w-full">
      <button onClick={onPlayToggle} className="bg-primary-light rounded-full p-1">
        {!isPlaying ? (
          <Play
            size={16}
            fill="#fff"
            color="#fff"
            strokeWidth={3}
            className="pl-[2px]"
          />
        ) : (
          <Pause size={16} color="#fff" fill="#fff" />
        )}
      </button>

      <div ref={containerRef} className={`cursor-pointer`} />
      <div className="w-[27px]">{currentTime}</div>
      <button onClick={onMuteToggle}>
        {!isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </div>
  )
}

export default memo(AudioVisualizer)
