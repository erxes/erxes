"use client"

import { useState } from "react"
import { ebarimtConfigAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

import { useToast } from "@/components/ui/use-toast"

import SettingsButton from "./components/Button"

const SendData = () => {
  const { ebarimtUrl, companyRD } = useAtomValue(ebarimtConfigAtom) || {}
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleClick = async () => {
    setLoading(true)

    fetch(`${ebarimtUrl}/sendData?lib=${companyRD}`)
      .then((res: any) => res.json())
      .then((res) => {
        if (res.success) {
          return toast({ description: `Амжилттай.` })
        }
        return toast({
          description: `Амжилтгүй: ${res.message}.`,
          variant: "destructive",
        })
      })
      .catch((e) => {
        toast({
          description: e.message,
          variant: "destructive",
        })
      })
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
