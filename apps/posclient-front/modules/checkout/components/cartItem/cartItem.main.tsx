import {
  LoyaltyDiscountBadge,
  LoyaltyDiscountReason,
} from "@/modules/customer/components/LoyaltyDiscountBadge"
import { StrikedPrice } from "@/modules/customer/components/StrikedPrice"
import { usePreviewUnitPrice } from "@/modules/customer/hooks/usePreviewUnitPrice"
import ProductPrice from "@/modules/products/productPriceInfo"
import { updateCartAtom } from "@/store/cart.store"
import { banFractionsAtom } from "@/store/config.store"
import { orderTypeAtom } from "@/store/order.store"
import { motion, Variants } from "framer-motion"
import { useAtomValue, useSetAtom } from "jotai"
import { ChevronDown, Minus, Plus } from "lucide-react"

import { OrderItem } from "@/types/order.types"
import { cn, formatNum } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { FocusChanger } from "@/components/ui/focus-changer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Uploader from "@/components/ui/uploader"

import { CartItemCondition, CartItemConditionBadge } from "./CartItemCondition"
import CartItemStatus from "./cartItemStatus"

const CartItem = ({
  productName,
  count,
  unitPrice,
  status,
  isTake,
  _id,
  description,
  attachment,
  idx,
  productId,
  discountInfos,
  conditionCode,
}: OrderItem & { idx: number }) => {
  const changeItem = useSetAtom(updateCartAtom)
  const banFractions = useAtomValue(banFractionsAtom)
  const type = useAtomValue(orderTypeAtom)
  const { price, originalPrice } = usePreviewUnitPrice(_id, unitPrice)

  return (
    <Collapsible
      className={cn(
        "group/item bg-background transition-colors hover:bg-accent/40",
        idx === 0 && "bg-primary/[0.03]"
      )}
    >
      <motion.div
        variants={itemVariants}
        animate="animate"
        initial="initial"
        exit="exit"
        transition={{
          duration: 0.3,
        }}
      >
        <div className={cn(CART_ROW_GRID, "px-3 py-2")}>
          <Label className="flex" htmlFor={_id}>
            {type === "eat" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Checkbox
                      id={_id}
                      aria-label="Авч явах"
                      checked={isTake}
                      onCheckedChange={(checked) =>
                        changeItem({ _id, isTake: !!checked })
                      }
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Авч явах</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
          <div className="min-w-0">
            <p
              title={productName}
              className="truncate text-[13px] font-medium leading-5"
            >
              {productName}
            </p>
            <div className="flex min-w-0 flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
              <CartItemStatus status={status} />
              <span className="tabular-nums">{count} ×</span>
              <ProductPrice
                unitPrice={price}
                productId={productId}
                className="h-auto p-0 text-xs font-normal text-muted-foreground tabular-nums hover:bg-transparent hover:text-foreground"
              />
              <StrikedPrice price={originalPrice} />
              <CartItemConditionBadge
                productId={productId}
                conditionCode={conditionCode}
              />
              <LoyaltyDiscountBadge
                itemId={_id}
                discountInfos={discountInfos}
              />
            </div>
            <LoyaltyDiscountReason itemId={_id} discountInfos={discountInfos} />
          </div>
          <div className="flex h-7 w-[5.25rem] items-center rounded-md border bg-background">
            <Button
              variant="ghost"
              aria-label="Хасах"
              className={stepButtonClass}
              onClick={() =>
                changeItem({ _id, count: (count || 0) - 1, status })
              }
            >
              <Minus className="size-3" />
            </Button>
            <FocusChanger>
              <Input
                aria-label="Тоо ширхэг"
                className="h-6 w-8 rounded-none border-0 bg-transparent px-0 text-center text-xs font-medium tabular-nums shadow-none focus-visible:shadow-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="number"
                onChange={(e) =>
                  changeItem({
                    _id,
                    count: banFractions
                      ? Number.parseInt(e.target.value)
                      : Number(e.target.value),
                    status,
                  })
                }
                value={count.toString()}
              />
            </FocusChanger>
            <Button
              variant="ghost"
              aria-label="Нэмэх"
              className={stepButtonClass}
              onClick={() => changeItem({ _id, count: (count || 0) + 1 })}
            >
              <Plus className="size-3" />
            </Button>
          </div>
          <span className="text-right text-[13px] font-semibold tabular-nums">
            {formatNum(price * (count || 0))}
          </span>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              aria-label="Нэмэлт мэдээлэл"
              title="Нэмэлт мэдээлэл"
              className="size-6 rounded-md p-0 text-muted-foreground hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground [&[data-state=open]>svg]:rotate-180"
            >
              <ChevronDown className="size-3.5 transition-transform" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2.5 px-3 pb-3 pt-0.5">
          <CartItemCondition
            _id={_id}
            productId={productId}
            conditionCode={conditionCode}
          />
          <div className="space-y-1.5">
            <Label
              htmlFor={`description-${_id}`}
              className="block text-xs font-medium text-muted-foreground"
            >
              Тайлбар
            </Label>
            <Input
              id={`description-${_id}`}
              className="h-7 rounded-sm border-0 bg-background text-[13px] shadow-xs focus-visible:shadow-focus"
              placeholder="Тайлбар бичих"
              value={description ?? ""}
              onChange={(e) => changeItem({ _id, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor={`attachment-${_id}`}
              className="block text-xs font-medium text-muted-foreground"
            >
              Хавсралт
            </Label>
            <Uploader
              id={`attachment-${_id}`}
              attachment={attachment}
              setAttachment={(attachment?: { url?: string } | null) =>
                changeItem({ _id, attachment })
              }
            />
          </div>
        </CollapsibleContent>
      </motion.div>
    </Collapsible>
  )
}

export const CART_ROW_GRID =
  "grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(3.5rem,auto)_auto] items-center gap-x-2"

const stepButtonClass =
  "size-6 flex-none rounded-[5px] p-0 text-muted-foreground hover:bg-accent hover:text-foreground"

export const countBtnClass =
  "h-7 w-7 rounded-sm p-0 bg-transparent text-primary shadow-none [text-shadow:none] before:hidden after:hidden hover:bg-primary hover:text-primary-foreground"

const itemVariants: Variants = {
  animate: {
    opacity: 1,
    height: "auto",
    transition: {
      opacity: {
        delay: 0.15,
        duration: 0.15,
      },
    },
  },
  initial: {
    opacity: 0,
    height: 0,
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      opacity: {
        delay: 0,
        duration: 0.1,
      },
    },
  },
}

export default CartItem
