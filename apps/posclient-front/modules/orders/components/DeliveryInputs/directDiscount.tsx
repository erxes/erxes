import React, { useEffect, useMemo, useState, type ChangeEvent } from "react"
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormRow,
} from "@/modules/record-side-panel"
import { modeAtom } from "@/store"
import { cartAtom, totalAmountAtom } from "@/store/cart.store"
import { directDiscountConfigAtom } from "@/store/config.store"
import { directDiscountAtom, directIsAmountAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"
import { PercentIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const DirectDiscount: React.FC = () => {
  const mode = useAtomValue(modeAtom)
  const { allowDirectDiscount, directDiscountLimit } = useAtomValue(
    directDiscountConfigAtom
  )
  const [directDiscount, setDirectDiscount] = useAtom(directDiscountAtom)
  const [isAmount, setIsAmount] = useAtom(directIsAmountAtom)
  const totalAmount = useAtomValue(totalAmountAtom)
  const cart = useAtomValue(cartAtom)
  const [discountDraft, setDiscountDraft] = useState("")
  const [isEditingDiscount, setIsEditingDiscount] = useState(false)
  const formatAmount = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  const formatDiscountInputValue = (value: number) =>
    value ? String(value) : ""
  const toPercent = (amount: number, baseAmount: number) =>
    baseAmount > 0 ? (amount * 100) / baseAmount : 0

  const { handDiscountAmount, nonHandInfoAmount, totalDiscountAmount } =
    useMemo(
      () =>
        cart.reduce(
          (total, item) => {
            total.totalDiscountAmount += Number(item.discountAmount) || 0

            for (const discountInfo of item.discountInfos || []) {
              const amount = Number(discountInfo.amount) || 0

              if (discountInfo.type === "hand") {
                total.handDiscountAmount += amount
              } else {
                total.nonHandInfoAmount += amount
              }
            }

            return total
          },
          {
            handDiscountAmount: 0,
            nonHandInfoAmount: 0,
            totalDiscountAmount: 0,
          }
        ),
      [cart]
    )
  const baseAmount = totalAmount + totalDiscountAmount
  const directDiscountAmount = isAmount
    ? directDiscount
    : (baseAmount * directDiscount) / 100
  const currentHandleDiscountAmount = directDiscount
    ? directDiscountAmount
    : handDiscountAmount
  const currentHandleDiscountInputValue = isAmount
    ? currentHandleDiscountAmount
    : toPercent(currentHandleDiscountAmount, baseAmount)

  useEffect(() => {
    if (!isEditingDiscount) {
      setDiscountDraft(
        formatDiscountInputValue(currentHandleDiscountInputValue)
      )
    }
  }, [currentHandleDiscountInputValue, isAmount, isEditingDiscount])

  useEffect(() => {
    if (directDiscount || !handDiscountAmount) {
      return
    }

    setDirectDiscount(
      isAmount ? handDiscountAmount : toPercent(handDiscountAmount, baseAmount)
    )
  }, [
    baseAmount,
    directDiscount,
    handDiscountAmount,
    isAmount,
    setDirectDiscount,
  ])

  if (!allowDirectDiscount) {
    return null
  }

  const getLimit = (isAm: boolean) =>
    isAm ? totalAmount * directDiscountLimit * 0.01 : directDiscountLimit

  const limit = getLimit(isAmount)

  const parseDraftNumber = (value: string) => {
    const parsed = Number(value.replace(/,/g, ""))
    return Number.isFinite(parsed) ? parsed : 0
  }

  const handleDirectDiscountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const draftValue = e.target.value
    const value = Number(parseDraftNumber(draftValue).toFixed(2))
    const clampedValue = Math.min(Math.max(value, 0), limit)

    setDiscountDraft(draftValue)
    setDirectDiscount(clampedValue)
  }

  const handleIsAmountChange = (value: string) => {
    const nextIsAmount = value === "amount"
    const nextDiscount = nextIsAmount
      ? currentHandleDiscountAmount
      : toPercent(currentHandleDiscountAmount, baseAmount)

    setIsEditingDiscount(false)
    setIsAmount(nextIsAmount)
    setDirectDiscount(nextDiscount)
    setDiscountDraft(formatDiscountInputValue(nextDiscount))
  }

  const nonHandDiscountAmount =
    nonHandInfoAmount || Math.max(totalDiscountAmount - handDiscountAmount, 0)
  const handleDiscountAmount = currentHandleDiscountAmount
  const discountAmount = nonHandDiscountAmount + handleDiscountAmount
  const discountPercent =
    baseAmount > 0
      ? Number(((discountAmount * 100) / baseAmount).toFixed(4))
      : 0

  const limitText = isAmount
    ? `${formatAmount(totalAmount * directDiscountLimit * 0.01)}₮`
    : `${directDiscountLimit}%`

  if (mode === "main") {
    return (
      <PanelFormRow label="Хөнгөлөлт" icon={PercentIcon}>
        <div className="flex items-center gap-1">
          <Tabs
            value={isAmount ? "amount" : "percent"}
            onValueChange={handleIsAmountChange}
          >
            <TabsList className="h-7 rounded-sm p-0.5">
              <TabsTrigger
                value="percent"
                className="h-6 w-7 rounded-sm px-0 text-xs font-semibold"
              >
                %
              </TabsTrigger>
              <TabsTrigger
                value="amount"
                className="h-6 w-7 rounded-sm px-0 text-xs font-semibold"
              >
                ₮
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            type="number"
            id="directDiscount"
            aria-label="Нэмэх хямдрал"
            placeholder={`max ${limitText}`}
            className={cn(
              PANEL_INPUT_CLASS_NAME,
              "min-w-0 flex-1 tabular-nums"
            )}
            value={discountDraft}
            onChange={handleDirectDiscountChange}
            onFocus={() => setIsEditingDiscount(true)}
            onBlur={() => {
              setIsEditingDiscount(false)
              setDiscountDraft(
                formatDiscountInputValue(currentHandleDiscountInputValue)
              )
            }}
          />
          {!!discountAmount && (
            <span className="flex-none text-xs tabular-nums text-muted-foreground">
              −{formatAmount(discountAmount)}₮
            </span>
          )}
        </div>
      </PanelFormRow>
    )
  }

  return (
    <>
      <div>
        <Label htmlFor="directDiscount" className="block pb-2">
          Нэмэх хямдрал оруулах (max:
          {isAmount
            ? ` ${formatAmount(totalAmount * directDiscountLimit * 0.01)}₮`
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
            placeholder={isAmount ? "Дүн оруулах" : "Хувь оруулах"}
            value={discountDraft}
            onChange={handleDirectDiscountChange}
            onFocus={() => setIsEditingDiscount(true)}
            onBlur={() => {
              setIsEditingDiscount(false)
              setDiscountDraft(
                formatDiscountInputValue(currentHandleDiscountInputValue)
              )
            }}
          />
          <span className="rounded-xs bg-background px-2 py-1 text-xs font-semibold tabular-nums text-foreground shadow-xs whitespace-nowrap">
            {discountPercent.toFixed(4)}%
          </span>
          <span className="rounded-xs bg-background px-2 py-1 text-xs font-semibold tabular-nums text-foreground shadow-xs whitespace-nowrap">
            {formatAmount(discountAmount)}₮
          </span>
        </div>
      </div>
    </>
  )
}

export default DirectDiscount
