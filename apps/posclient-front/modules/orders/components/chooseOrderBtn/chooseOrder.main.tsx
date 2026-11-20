import { nextOrderIdAtom } from "@/store"
import { activeOrderIdAtom } from "@/store/order.store"
import { cva } from "class-variance-authority"
import { useAtomValue, useSetAtom } from "jotai"
import { AlarmClockIcon, CheckIcon } from "lucide-react"

import { IOrder } from "@/types/order.types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ChooseOrder = ({
  number,
  status,
  _id,
  slotCode,
  origin,
  isPre,
}: IOrder) => {
  const activeOrder = useAtomValue(activeOrderIdAtom)
  const setNextOrder = useSetAtom(nextOrderIdAtom)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              statusVariants({ status }),
              activeOrder === _id &&
                "bg-primary/10 text-primary ring-2 ring-primary hover:bg-primary/15 hover:text-primary"
            )}
            onClick={() => setNextOrder(_id)}
          >
            {activeOrder === _id && (
              <CheckIcon className="-ml-0.5 h-3.5 w-3.5" strokeWidth={3} />
            )}
            {isPre && <AlarmClockIcon className="h-4 w-4" strokeWidth={2.2} />}
            {(number || "").split("_")[1]}
            {slotCode && ` (${slotCode})`}
            {origin === "kiosk" && "*"}
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
  "relative mx-1 my-2 h-8 gap-1 overflow-visible whitespace-nowrap rounded-lg px-3 text-[13px] font-semibold tabular-nums ring-1 ring-inset",
  {
    variants: {
      status: {
        pending:
          "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100 hover:text-amber-800",
        reDoing:
          "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100 hover:text-amber-800",
        doing:
          "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100 hover:text-amber-800",
        done: "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100 hover:text-emerald-800",
        complete:
          "bg-teal-50 text-teal-700 ring-teal-200 hover:bg-teal-100 hover:text-teal-800",
        new: "bg-muted text-foreground ring-border hover:bg-accent",
      },
    },
    defaultVariants: {
      status: "new",
    },
  }
)

export default ChooseOrder
