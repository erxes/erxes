import React, { ChangeEvent, useEffect } from "react"
import { totalAmountAtom } from "@/store/cart.store"
import { permissionConfigAtom } from "@/store/config.store"
import {
  directDiscountAtom,
  directDiscountTypeAtom,
  savedDirectDiscountAtom,
} from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const DirectDiscount: React.FC = () => {
  const permissionConfig = useAtomValue(permissionConfigAtom)
  const { directDiscount: directDiscountCheck, directDiscountLimit } =
    permissionConfig || {}

  const allowDirectDiscount = directDiscountCheck && directDiscountLimit
  const [directDiscount, setDirectDiscount] = useAtom(directDiscountAtom)
  const savedDiscount = useAtomValue(savedDirectDiscountAtom)
  const [type, setType] = useAtom(directDiscountTypeAtom)
  const totalAmount = useAtomValue(totalAmountAtom)

  useEffect(() => {
    type === "amount" && setDirectDiscount((directDiscount * totalAmount) / 100)
    type === "percent" &&
      setDirectDiscount((directDiscount / totalAmount) * 100)
  }, [type])

  if (!allowDirectDiscount) {
    return null
  }

  const limit =
    type === "percent"
      ? directDiscountLimit
      : (totalAmount / (100 - savedDiscount)) * directDiscountLimit

  const handleDirectDiscountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(Number(e.target.value).toFixed(2))
    const clampedValue = Math.min(Math.max(value, 0), limit)
    setDirectDiscount(clampedValue)
  }

  return (
    <>
      <Separator />
      <div>
        <Label htmlFor="directDiscount" className="block pb-2">
          Хямдарлын {type === "percent" ? "хувь" : "дүн"} оруулах (max:
          {type === "percent"
            ? ` ${directDiscountLimit}%`
            : ` ${(
                totalAmount *
                directDiscountLimit *
                0.01
              ).toLocaleString()}₮`}
          )
        </Label>
        <div className="flex items-center gap-2">
          <Tabs
            value={type}
            onValueChange={(value) => setType(value as "percent" | "amount")}
          >
            <TabsList className="h-10">
              <TabsTrigger
                value="percent"
                className="font-black text-base leading-snug w-10"
              >
                %
              </TabsTrigger>
              <TabsTrigger
                value="amount"
                className="font-bold text-base leading-snug w-10"
              >
                ₮
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            type="number"
            id="directDiscount"
            value={directDiscount === 0 ? "" : directDiscount}
            onChange={handleDirectDiscountChange}
          />
        </div>
      </div>
    </>
  )
}

export default DirectDiscount
