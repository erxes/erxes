"use client"

import { printSeparatelyAtom } from "@/store"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { Label } from "@radix-ui/react-label"
import { useAtom } from "jotai"

import { Checkbox } from "@/components/ui/checkbox"

const ActivateOrderPrint = () => {
  const [printSeparately, setPrintSeparately] = useAtom(printSeparatelyAtom)

  const handleCheckboxChange = (checked: CheckedState) => {
    setPrintSeparately(checked === true)
  }

  return (
    <Label
      className="flex items-center w-full gap-2 pb-5 cursor-pointer"
      htmlFor="printSeparately"
    >
      <Checkbox
        id="printSeparately"
        checked={printSeparately}
        onCheckedChange={handleCheckboxChange}
      />
      Тус бүрээр нь хэвлэх
    </Label>
  )
}

export default ActivateOrderPrint
