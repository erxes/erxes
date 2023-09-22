import { updateCartAtom } from "@/store/cart.store"
import { Variants, motion } from "framer-motion"
import { useSetAtom } from "jotai"
import { Minus, Plus } from "lucide-react"

import { OrderItem } from "@/types/order.types"
import { formatNum } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import CartItemStatus from "./cartItemStatus"

const CartItem = ({
  productName,
  count,
  unitPrice,
  status,
  isTake,
  _id,
}: OrderItem) => {
  const changeItem = useSetAtom(updateCartAtom)

  return (
    <motion.div
      className="mx-4 flex items-stretch overflow-hidden border-b "
      variants={itemVariants}
      animate="animate"
      initial="initial"
      exit="exit"
      transition={{
        duration: 0.3,
      }}
    >
      <Label className="flex w-1/12 items-center" htmlFor={_id}>
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
          onChange={(e) => changeItem({ _id, count: Number(e.target.value) })}
          value={count}
        />
        <Button
          className={countBtnClass}
          onClick={() => changeItem({ _id, count: (count || 0) + 1 })}
        >
          <Plus className="h-3 w-3" strokeWidth={4} />
        </Button>
      </div>
    </motion.div>
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
