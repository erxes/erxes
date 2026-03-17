"use client"

import { printSeparatelyAtom } from "@/store"
import { Label } from "@radix-ui/react-label"
import { useAtom } from "jotai"

import { Checkbox } from "@/components/ui/checkbox"

const ActivateOrderPrint = () => {
  const [printSeparately, setPrintSeparately] = useAtom(printSeparatelyAtom)

  const handleCheckboxChange = (checked: boolean) => {
    setPrintSeparately(checked)
  }

  return (
    <Label
      className="flex gap-2 items-center pb-5 w-full cursor-pointer"
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
