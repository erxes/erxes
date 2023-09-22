"use client"

import useConfig from "@/modules/auth/hooks/useConfig"
import ChooseTheme from "@/modules/settings/ChooseTheme"
import GolomtConfig from "@/modules/settings/components/GolomtConfig"
import Grid from "@/modules/settings/components/Grid"
import StatusExplain from "@/modules/settings/components/StatusExplain"
import { configAtom, currentUserAtom } from "@/store/config.store"
import { useAtom } from "jotai"
import { Loader2 } from "lucide-react"

import Image from "@/components/ui/image"

const Settings = () => {
  const [user] = useAtom(currentUserAtom)
  const [currentConfig] = useAtom(configAtom)
  const { config, loading } = useConfig("settings")

  const { details, email } = user || {}

  if (loading) return <Loader2 className="animate-spin" />

  return (
    <>
      <Image
        alt=""
        src="/user.png"
        height={80}
        width={80}
        className="rounded-full"
      />
      <div className="mb-1 mt-3 font-bold">{details?.fullName}</div>
      <div className="mb-5">{email}</div>
      <div className="mb-4 w-full rounded-lg bg-neutral-100 py-2 text-center">
        <p>{currentConfig?.name}</p>
        <div className="font-bold">{config?.createdAt}</div>
      </div>
      <ChooseTheme />
      <Grid config={config} />
      <GolomtConfig paymentTypes={config.paymentTypes} />
      <StatusExplain />
    </>
  )
}

export default Settings
