import { useMemo } from "react"
import { parseISO } from "date-fns"
import { atom, useAtomValue } from "jotai"

const nowAtom = atom(Date.now())

nowAtom.onMount = (setNow) => {
  setNow(Date.now())
  const interval = setInterval(() => setNow(Date.now()), 1000)

  return () => clearInterval(interval)
}

const useTimer = (targetDate: string) => {
  const now = useAtomValue(nowAtom)
  const targetTime = useMemo(() => parseISO(targetDate).getTime(), [targetDate])
  const remainingTime = targetTime - now

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
