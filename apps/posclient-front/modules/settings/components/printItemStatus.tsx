import { printOnlyNewItemsAtom } from "@/store"
import { configAtom } from "@/store/config.store"
import { useAtom, useAtomValue } from "jotai"
import {
  Label as LabelPrimitive,
  type Checkbox as CheckboxPrimitive,
} from "radix-ui"

import { Checkbox } from "@/components/ui/checkbox"

const PrintItemStatus = () => {
  const [printOnlyNew, setPrintOnlyNew] = useAtom(printOnlyNewItemsAtom)
  const config = useAtomValue(configAtom)
  const { isActive, isPrint } = config?.kitchenScreen || {}

  if (isActive || !isPrint) {
    return null
  }

  return (
    <LabelPrimitive.Root
      className="w-full pb-5 flex gap-2 items-center"
      htmlFor="printOnlyNew"
    >
      <Checkbox
        checked={printOnlyNew}
        id="printOnlyNew"
        onCheckedChange={(checked: CheckboxPrimitive.CheckedState) =>
          setPrintOnlyNew(checked === true)
        }
      />
      Зөвхөн шинэ бүтээгдэхүүнийг хэвлэх
    </LabelPrimitive.Root>
  )
}

export default PrintItemStatus
