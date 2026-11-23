import { printOnlyNewItemsAtom } from "@/store"
import { configAtom } from "@/store/config.store"
import { useAtom, useAtomValue } from "jotai"

import { Switch } from "@/components/ui/switch"

import { SettingsRow } from "./SettingsSection"

const PrintItemStatus = () => {
  const [printOnlyNew, setPrintOnlyNew] = useAtom(printOnlyNewItemsAtom)
  const config = useAtomValue(configAtom)
  const { isActive, isPrint } = config?.kitchenScreen || {}

  if (isActive || !isPrint) {
    return null
  }

  return (
    <SettingsRow
      title="Зөвхөн шинэ барааг хэвлэх"
      description="Гал тогооны баримтад шинээр нэмэгдсэн барааг л хэвлэнэ"
      htmlFor="printOnlyNew"
      control={
        <Switch
          id="printOnlyNew"
          checked={printOnlyNew}
          onCheckedChange={setPrintOnlyNew}
        />
      }
    />
  )
}

export default PrintItemStatus
