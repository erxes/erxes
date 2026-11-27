"use client"

import { printSeparatelyAtom } from "@/store"
import { useAtom } from "jotai"

import { Switch } from "@/components/ui/switch"

import { SettingsRow } from "./SettingsSection"

const ActivateOrderPrint = () => {
  const [printSeparately, setPrintSeparately] = useAtom(printSeparatelyAtom)

  return (
    <SettingsRow
      title="Тус бүрээр нь хэвлэх"
      description="Захиалгын бараа бүрийг тусдаа баримтаар хэвлэнэ"
      htmlFor="printSeparately"
      control={
        <Switch
          id="printSeparately"
          checked={printSeparately}
          onCheckedChange={setPrintSeparately}
        />
      }
    />
  )
}

export default ActivateOrderPrint
