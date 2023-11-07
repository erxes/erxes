import { useEffect, useState } from "react"
import { parseISO } from "date-fns"

const useTimer = (targetDate: string) => {
  const [remainingTime, setRemainingTime] = useState<number>(
    parseISO(targetDate).getTime() - new Date().getTime()
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date()
      const distance = parseISO(targetDate).getTime() - currentTime.getTime()
      setRemainingTime(distance)
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [targetDate])

  const _0 = (value: number) => {
    return value < 10 ? `0${value}` : value
  }

  const formatDate = (time: number) => {
    const positive = time >= 0 ? time : time * -1
    const totalSeconds = Math.ceil(positive / 1000)
    const hh = Math.floor(totalSeconds / 3600)
    const mm = Math.floor((totalSeconds - hh * 3600) / 60)
    const ss = totalSeconds - hh * 3600 - mm * 60

    return `${_0(hh)}:${_0(mm)}:${_0(ss)}`
  }

  return {
    remainingTime: formatDate(remainingTime),
    seconds: Math.ceil(remainingTime / 1000),
  }
}

export default useTimer
