"use client"

import { printSeparatelyAtom } from "@/store"
import { useAtom } from "jotai"
import {
  Label as LabelPrimitive,
  type Checkbox as CheckboxPrimitive,
} from "radix-ui"

import { Checkbox } from "@/components/ui/checkbox"

const ActivateOrderPrint = () => {
  const [printSeparately, setPrintSeparately] = useAtom(printSeparatelyAtom)

  const handleCheckboxChange = (checked: CheckboxPrimitive.CheckedState) => {
    setPrintSeparately(checked === true)
  }

  return (
    <LabelPrimitive.Root
      className="flex items-center w-full gap-2 pb-5 cursor-pointer"
      htmlFor="printSeparately"
    >
      <Checkbox
        id="printSeparately"
        checked={printSeparately}
        onCheckedChange={handleCheckboxChange}
      />
      Тус бүрээр нь хэвлэх
    </LabelPrimitive.Root>
  )
}

export default ActivateOrderPrint
