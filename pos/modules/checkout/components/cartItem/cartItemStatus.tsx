import { cva } from "class-variance-authority"

import { IOrderItemStatus } from "@/types/order.types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const CartItemStatus = ({ status }: { status?: IOrderItemStatus }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={statusVariants({ status })} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{status}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const statusVariants = cva("h-2 w-2 rounded", {
  variants: {
    status: {
      confirm: "bg-amber-400",
      done: "bg-green-400",
      new: "bg-zinc-500",
    },
  },
  defaultVariants: {
    status: "new",
  },
})

export default CartItemStatus
