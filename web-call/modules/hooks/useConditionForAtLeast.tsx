import { useEffect, useState } from "react"

export function useConditionForAtLeast(condition: boolean, time: number) {
  const [value, setValue] = useState(condition)

  useEffect(() => {
    let timeout = window.setTimeout(() => {
      setValue(condition)
    }, time)
    return () => {
      clearTimeout(timeout)
    }
  }, [condition, time])

  return value
}
