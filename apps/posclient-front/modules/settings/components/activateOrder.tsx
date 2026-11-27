"use client"

import { orderNotificationEnabledAtom } from "@/store"
import { useAtom } from "jotai"

import { Switch } from "@/components/ui/switch"

import { SettingsRow } from "./SettingsSection"

const ActivateOrderQr = () => {
  const [isEnabled, setIsEnabled] = useAtom(orderNotificationEnabledAtom)

  return (
    <SettingsRow
      title="QR мэню идэвхтэй"
      description="QR мэнюгээр ирсэн захиалгын мэдэгдэл авна"
      htmlFor="orderNotification"
      control={
        <Switch
          id="orderNotification"
          checked={isEnabled}
          onCheckedChange={setIsEnabled}
        />
      }
    />
  )
}

export default ActivateOrderQr
