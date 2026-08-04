"use client"

import { orderNotificationEnabledAtom } from "@/store"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { Label } from "@radix-ui/react-label"
import { useAtom } from "jotai"

import { Checkbox } from "@/components/ui/checkbox"

const ActivateOrderQr = () => {
  const [isEnabled, setIsEnabled] = useAtom(orderNotificationEnabledAtom)
  const handleCheckboxChange = (checked: CheckedState) => {
    setIsEnabled(checked === true)
  }

  return (
    <Label
      className="w-full pb-5 flex gap-2 items-center cursor-pointer"
      htmlFor="orderNotification"
    >
      <Checkbox
        id="orderNotification"
        checked={isEnabled}
        onCheckedChange={handleCheckboxChange}
      />
      QR мэню идэвхтэй
    </Label>
  )
}

export default ActivateOrderQr
