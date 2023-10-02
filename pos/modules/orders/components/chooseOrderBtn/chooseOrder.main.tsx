import { activeOrderIdAtom, setInitialAtom } from "@/store/order.store"
import { cva } from "class-variance-authority"
import { useAtom } from "jotai"
import { CheckIcon } from "lucide-react"

import { IOrder } from "@/types/order.types"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ChooseOrder = ({ number, status, _id, slotCode, origin }: IOrder) => {
  const [activeOrder, setActiveOrder] = useAtom(activeOrderIdAtom)
  const [, setInitialState] = useAtom(setInitialAtom)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={statusVariants({ status })}
            onClick={() =>
              activeOrder === _id ? setInitialState() : setActiveOrder(_id)
            }
          >
            {(number || "").split("_")[1]}
            {slotCode && ` (${slotCode})`}
            {origin === "kiosk" && "*"}
            {activeOrder === _id && (
              <span className="absolute -right-2 -top-2  rounded-full border-2 border-white bg-inherit p-1 text-white">
                <CheckIcon className="h-3 w-3" strokeWidth={4} />
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {(number || "").split("_")[0]} {status}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const statusVariants = cva(
  "font-extrabold relative overflow-visible my-2 mx-1 py-2 h-auto text-sm whitespace-nowrap",
  {
    variants: {
      status: {
        pending: "bg-amber-400 hover:bg-amber-400/90",
        reDoing: "bg-amber-400 hover:bg-amber-400/90",
        doing: "bg-amber-400 hover:bg-amber-400/90",
        done: "bg-green-400 hover:bg-green-400/90",
        complete: "bg-green-300 hover:bg-green-300/90",
        new: "bg-zinc-500 hover:bg-zinc-500/90",
      },
    },
    defaultVariants: {
      status: "new",
    },
  }
)

export default ChooseOrder
