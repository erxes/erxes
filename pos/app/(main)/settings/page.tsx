"use client"

import ChooseTheme from "@/modules/settings/ChooseTheme"
import CategoriesToPrint from "@/modules/settings/components/categoriesToPrint"
import GolomtConfig from "@/modules/settings/components/GolomtConfig"
import Grid from "@/modules/settings/components/Grid"
import PrintItemStatus from "@/modules/settings/components/printItemStatus"
import ProductSimilarityConfig from "@/modules/settings/components/ProductSimilarityConfig"
import ScrollerWidth from "@/modules/settings/components/ScrollerWidth"
import StatusExplain from "@/modules/settings/components/StatusExplain"
import { configAtom, currentUserAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"

import Image from "@/components/ui/image"

const Settings = () => {
  const { details, email } = useAtomValue(currentUserAtom) || {}
  const config = useAtomValue(configAtom)

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
        <p>{config?.name}</p>
        <div className="font-bold">{config?.createdAt}</div>
      </div>
      <ChooseTheme />
      <Grid />
      <GolomtConfig />
      <ProductSimilarityConfig />
      <ScrollerWidth />
      <PrintItemStatus />
      <CategoriesToPrint />
      <StatusExplain />
    </>
  )
}

export default Settings
