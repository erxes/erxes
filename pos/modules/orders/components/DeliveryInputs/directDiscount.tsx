import React, { type ChangeEvent } from "react"
import { modeAtom } from "@/store"
import { totalAmountAtom } from "@/store/cart.store"
import { directDiscountConfigAtom } from "@/store/config.store"
import { directDiscountAtom, directIsAmountAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const DirectDiscount: React.FC = () => {
  const mode = useAtomValue(modeAtom)
  const { allowDirectDiscount, directDiscountLimit } = useAtomValue(
    directDiscountConfigAtom
  )
  const [directDiscount, setDirectDiscount] = useAtom(directDiscountAtom)
  const [isAmount, setIsAmount] = useAtom(directIsAmountAtom)
  const totalAmount = useAtomValue(totalAmountAtom)

  if (!allowDirectDiscount) {
    return null
  }

  const getLimit = (isAm: boolean) =>
    isAm ? totalAmount * directDiscountLimit * 0.01 : directDiscountLimit

  const limit = getLimit(isAmount)

  const handleDirectDiscountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(Number(e.target.value).toFixed(2))
    const clampedValue = Math.min(Math.max(value, 0), limit)
    setDirectDiscount(clampedValue)
  }

  const handleIsAmountChange = (value: string) => {
    setIsAmount(value === "amount")
    if (directDiscount) {
      setDirectDiscount(
        Number(
          (value === "amount"
            ? directDiscount * totalAmount * 0.01
            : (directDiscount / totalAmount) * 100
          ).toFixed(1)
        )
      )
    }
  }

  return (
    <>
      {mode === "main" && <Separator />}
      <div>
        <Label htmlFor="directDiscount" className="block pb-2">
          Хямдарлын {isAmount ? "дүн" : "хувь"} оруулах (max:
          {isAmount
            ? ` ${(totalAmount * directDiscountLimit * 0.01).toLocaleString()}₮`
            : ` ${directDiscountLimit}%`}
          )
        </Label>
        <div className="flex items-center gap-2">
          <Tabs
            value={isAmount ? "amount" : "percent"}
            onValueChange={handleIsAmountChange}
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
