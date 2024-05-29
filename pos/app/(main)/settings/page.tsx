"use client"

import useConfig from "@/modules/auth/hooks/useConfig"
import ChooseTheme from "@/modules/settings/ChooseTheme"
import GolomtConfig from "@/modules/settings/components/GolomtConfig"
import Grid from "@/modules/settings/components/Grid"
import ProductSimilarityConfig from "@/modules/settings/components/ProductSimilarityConfig"
import ScrollerWidth from "@/modules/settings/components/ScrollerWidth"
import StatusExplain from "@/modules/settings/components/StatusExplain"
import { configAtom, currentUserAtom } from "@/store/config.store"
import { useAtom } from "jotai"

import Image from "@/components/ui/image"
import Loader from "@/components/ui/loader"

const Settings = () => {
  const [user] = useAtom(currentUserAtom)
  const [currentConfig] = useAtom(configAtom)
  const { config, loading } = useConfig("settings")

  const { details, email } = user || {}

  if (loading) return <Loader className="h-[40rem] max-h-[95vh] w-full" />

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
      <ProductSimilarityConfig />
      <ScrollerWidth />
      <StatusExplain />
    </>
  )
}

export default Settings
