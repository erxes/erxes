import { updateCartAtom } from "@/store/cart.store"
import { motion, Variants } from "framer-motion"
import { useSetAtom } from "jotai"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Uploader from "@/components/ui/uploader"

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
}: OrderItem & { idx: number }) => {
  const changeItem = useSetAtom(updateCartAtom)

  return (
    <Collapsible className={cn(idx === 0 && "bg-primary/10")}>
      <motion.div
        variants={itemVariants}
        animate="animate"
        initial="initial"
        className="border-b mx-4"
        exit="exit"
        transition={{
          duration: 0.3,
        }}
      >
        <div className={"flex items-stretch overflow-hidden"}>
          <Label
            className="flex w-1/12 flex-col justify-between pt-4 pb-3"
            htmlFor={_id}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Checkbox
                    id={_id}
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CollapsibleTrigger asChild>
                    <Button className="h-6 w-6 p-0" variant="ghost">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Нэмэлт мэдээлэл</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <div className=" w-7/12 py-4 pl-3 text-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <small className="block h-8 overflow-hidden leading-4">
                    {productName}
                  </small>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{productName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="mt-1 flex items-center">
              <CartItemStatus status={status} />
              <div className="ml-2 text-xs font-extrabold">
                {formatNum(unitPrice)}₮
              </div>
            </div>
          </div>
          <div className="flex w-5/12 items-center justify-end">
            <Button
              className={countBtnClass}
              onClick={() => changeItem({ _id, count: (count || 0) - 1 })}
            >
              <Minus className="h-3 w-3" strokeWidth={4} />
            </Button>
            <Input
              className="mx-2 w-8 border-none p-1 text-center text-sm font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              type="number"
              onChange={(e) =>
                changeItem({ _id, count: Number(e.target.value) })
              }
              value={count}
            />
            <Button
              className={countBtnClass}
              onClick={() => changeItem({ _id, count: (count || 0) + 1 })}
            >
              <Plus className="h-3 w-3" strokeWidth={4} />
            </Button>
          </div>
        </div>
        <CollapsibleContent className="w-full pb-3 space-y-2">
          <div>
            <Label htmlFor="description">Тайлбар</Label>
            <Input
              id="description"
              placeholder="Тайлбар бичих"
              value={description}
              onChange={(e) => changeItem({ _id, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="attachment">Хавсралт</Label>
            <Uploader
              id="attachment"
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

const countBtnClass =
  "h-7 w-7 rounded-full p-0 bg-amber-400 hover:bg-amber-400/90 text-black"

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
