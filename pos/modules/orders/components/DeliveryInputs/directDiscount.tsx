import React, { ChangeEvent } from "react"
import { permissionConfigAtom } from "@/store/config.store"
import { directDiscountAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const DirectDiscount: React.FC = () => {
  const permissionConfig = useAtomValue(permissionConfigAtom)
  const { directDiscount: directDiscountCheck, directDiscountLimit } =
    permissionConfig || {}
  const [directDiscount, setDirectDiscount] = useAtom(directDiscountAtom)
  const allowDirectDiscount = directDiscountCheck && directDiscountLimit

  if (!allowDirectDiscount) {
    return null
  }

  const handleDirectDiscountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(Number(e.target.value).toFixed(2))
    const clampedValue = Math.min(Math.max(value, 0), directDiscountLimit)
    setDirectDiscount(clampedValue)
  }

  return (
    <>
      <Separator />
      <div>
        <Label htmlFor="directDiscount" className="block pb-1">
          Хямдарлын хувь оруулах
        </Label>
        <Input
          type="number"
          id="directDiscount"
          value={directDiscount}
          onChange={handleDirectDiscountChange}
        />
      </div>
    </>
  )
}

export default DirectDiscount
