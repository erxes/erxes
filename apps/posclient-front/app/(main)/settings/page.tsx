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
import {
  SettingsRow,
  SettingsSection,
} from "@/modules/settings/components/SettingsSection"
import {
  SettingsSectionKey,
  useSettingsSections,
} from "@/modules/settings/useSettingsSections"
import { configAtom, currentUserAtom } from "@/store/config.store"
import { format } from "date-fns"
import { useAtomValue } from "jotai"
import { BellIcon, MonitorIcon, PrinterIcon, StoreIcon } from "lucide-react"

const getInitials = (value?: string) =>
  (value || "")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

const ProfileSettings = () => {
  const { details, email } = useAtomValue(currentUserAtom) || {}
  const config = useAtomValue(configAtom)
  const name = details?.fullName || email

  return (
    <>
      <section className="select-none rounded-xl border bg-card">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex size-10 flex-none items-center justify-center rounded-full bg-muted text-[13px] font-semibold text-muted-foreground">
            {getInitials(name)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold tracking-tight">
                {name}
              </p>
              <span
                className="size-1.5 flex-none rounded-full bg-emerald-500"
                aria-label="Нэвтэрсэн"
              />
            </div>
            {!!details?.fullName && (
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            )}
          </div>
        </div>
      </section>
      <SettingsSection
        title="Касс"
        description="Энэ төхөөрөмжийн ПОС"
        icon={StoreIcon}
      >
        <SettingsRow
          title="Нэр"
          control={
            <span className="text-xs font-medium">
              {config?.name?.trim() || "—"}
            </span>
          }
        />
        {!!config?.createdAt && (
          <SettingsRow
            title="Үүсгэсэн огноо"
            control={
              <span className="text-xs tabular-nums text-muted-foreground">
                {format(new Date(config.createdAt), "yyyy.MM.dd HH:mm")}
              </span>
            }
          />
        )}
      </SettingsSection>
    </>
  )
}

const SECTION_CONTENT: Record<SettingsSectionKey, () => React.ReactNode> = {
  profile: () => <ProfileSettings />,
  appearance: () => (
    <SettingsSection
      title="Дэлгэц"
      description="Кассын загвар, барааны жагсаалт"
      icon={MonitorIcon}
    >
      <ChooseTheme />
      <ProductSimilarityConfig />
      <ScrollerWidth />
    </SettingsSection>
  ),
  printing: () => (
    <>
      <SettingsSection
        title="Захиалга"
        description="Шинэ захиалга ирэхэд хэрхэн мэдэгдэх"
        icon={BellIcon}
      >
        <ActivateOrderQr />
      </SettingsSection>
      <SettingsSection
        title="Хэвлэлт"
        description="Баримт, бэлтгэлийн хуудас хэвлэх"
        icon={PrinterIcon}
      >
        <ActiveteOrderPrint />
        <PrintItemStatus />
        <QzTraySettings />
        <CategoriesToPrint />
      </SettingsSection>
    </>
  ),
  terminal: () => <GolomtConfig />,
  sync: () => <Grid />,
}

const Settings = () => {
  const { active } = useSettingsSections()

  return (
    <div className="mx-auto max-w-2xl space-y-3 px-4 py-10">
      {SECTION_CONTENT[active.value]()}
    </div>
  )
}

export default Settings
