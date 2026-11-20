"use client"

import ChooseTheme from "@/modules/settings/ChooseTheme"
import ActivateOrderQr from "@/modules/settings/components/activateOrder"
import ActiveteOrderPrint from "@/modules/settings/components/activeteOrderPrint"
import CategoriesToPrint from "@/modules/settings/components/categoriesToPrint"
import GolomtConfig from "@/modules/settings/components/GolomtConfig"
import Grid from "@/modules/settings/components/Grid"
import PrintItemStatus from "@/modules/settings/components/printItemStatus"
import ProductSimilarityConfig from "@/modules/settings/components/ProductSimilarityConfig"
import QzTraySettings from "@/modules/settings/components/qzTraySettings"
import ScrollerWidth from "@/modules/settings/components/ScrollerWidth"
import StatusExplain from "@/modules/settings/components/StatusExplain"
import { configAtom, currentUserAtom } from "@/store/config.store"
import { format } from "date-fns"
import { useAtomValue } from "jotai"

import Image from "@/components/ui/image"

const Settings = () => {
  const { details, email } = useAtomValue(currentUserAtom) || {}
  const config = useAtomValue(configAtom)

  return (
    <>
      <div className="flex w-full items-center gap-3 pb-5">
        <Image
          alt=""
          src="/user.png"
          height={48}
          width={48}
          className="h-12 w-12 flex-none rounded-full"
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {details?.fullName}
          </div>
          <div className="truncate text-xs text-muted-foreground">{email}</div>
        </div>
      </div>
      <div className="mb-5 flex w-full items-center justify-between gap-3 rounded-lg border bg-sidebar px-3 py-2.5 text-xs">
        <span className="truncate font-medium">{config?.name}</span>
        {!!config?.createdAt && (
          <span className="flex-none tabular-nums text-muted-foreground">
            {format(new Date(config.createdAt), "yyyy.MM.dd HH:mm")}
          </span>
        )}
      </div>
      <ChooseTheme />
      <Grid />
      <GolomtConfig />
      <ProductSimilarityConfig />
      <ScrollerWidth />
      <PrintItemStatus />
      <ActivateOrderQr />
      <ActiveteOrderPrint />
      <QzTraySettings />
      <CategoriesToPrint />
      <StatusExplain />
    </>
  )
}

export default Settings
