"use client"

import { useState } from "react"
import { ebarimtConfigAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

import { onError, toast } from "@/components/ui/use-toast"

import SettingsButton from "./components/Button"

const SendData = () => {
  const { ebarimtUrl } = useAtomValue(ebarimtConfigAtom) || {}
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)

    fetch(`${ebarimtUrl}/rest/sendData`)
      .then((res: any) => res.json())
      .then((res) => {
        if (res.success) {
          return toast({ description: `Амжилттай.` })
        }
        return onError(res.message)
      })
      .catch((e) => onError(e?.message))
      .then(() => {
        setLoading(false)
      })
  }

  return (
    <SettingsButton disabled={loading} onClick={handleClick}>
      Send - Data
    </SettingsButton>
  )
}

export default SendData
