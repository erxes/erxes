import { printOnlyNewItemsAtom } from "@/store"
import { configAtom } from "@/store/config.store"
import { Label } from "@radix-ui/react-label"
import { useAtom, useAtomValue } from "jotai"

import { Checkbox } from "@/components/ui/checkbox"

const PrintItemStatus = () => {
  const [printOnlyNew, setPrintOnlyNew] = useAtom(printOnlyNewItemsAtom)
  const config = useAtomValue(configAtom)
  const { isActive, isPrint } = config?.kitchenScreen || {}

  if (isActive || !isPrint) {
    return null
  }

  return (
    <Label
      className="w-full pb-5 flex gap-2 items-center"
      htmlFor="printOnlyNew"
    >
      <Checkbox
        checked={printOnlyNew}
        id="printOnlyNew"
        onCheckedChange={(checked: boolean) => setPrintOnlyNew(checked)}
      />
      Зөвхөн шинэ бүтээгдэхүүнийг хэвлэх
    </Label>
  )
}

export default PrintItemStatus
