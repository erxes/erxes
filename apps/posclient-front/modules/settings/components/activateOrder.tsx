"use client"

import { orderNotificationEnabledAtom } from "@/store"
import { useAtom } from "jotai"
import {
  Label as LabelPrimitive,
  type Checkbox as CheckboxPrimitive,
} from "radix-ui"

import { Checkbox } from "@/components/ui/checkbox"

const ActivateOrderQr = () => {
  const [isEnabled, setIsEnabled] = useAtom(orderNotificationEnabledAtom)
  const handleCheckboxChange = (checked: CheckboxPrimitive.CheckedState) => {
    setIsEnabled(checked === true)
  }

  return (
    <LabelPrimitive.Root
      className="w-full pb-5 flex gap-2 items-center cursor-pointer"
      htmlFor="orderNotification"
    >
      <Checkbox
        id="orderNotification"
        checked={isEnabled}
        onCheckedChange={handleCheckboxChange}
      />
      QR мэню идэвхтэй
    </LabelPrimitive.Root>
  )
}

export default ActivateOrderQr
