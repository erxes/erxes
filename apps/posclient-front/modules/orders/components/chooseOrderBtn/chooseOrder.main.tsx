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
                "bg-primary/10 text-primary ring-primary hover:bg-primary/15 hover:text-primary"
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
  "relative mx-0.5 my-1.5 h-7 gap-1 overflow-visible whitespace-nowrap rounded-md px-2.5 text-[13px] font-medium tabular-nums ring-1 ring-inset",
  {
    variants: {
      status: {
        pending:
          "bg-warning/10 text-warning ring-warning/20 hover:bg-warning/15 hover:text-warning",
        reDoing:
          "bg-warning/10 text-warning ring-warning/20 hover:bg-warning/15 hover:text-warning",
        doing:
          "bg-warning/10 text-warning ring-warning/20 hover:bg-warning/15 hover:text-warning",
        done: "bg-success/10 text-success ring-success/20 hover:bg-success/15 hover:text-success",
        complete:
          "bg-info/10 text-info ring-info/20 hover:bg-info/15 hover:text-info",
        new: "bg-background text-foreground shadow-xs ring-transparent hover:bg-accent",
      },
    },
    defaultVariants: {
      status: "new",
    },
  }
)

export default ChooseOrder
