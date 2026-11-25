import { activeOrderIdAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"
import { Ellipsis } from "lucide-react"

import { ISlot } from "@/types/slots.type"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { SlotStatus, slotStatusOf } from "../slotStatuses"
import SlotActions from "./slotActions"

const Slot = (
  props: ISlot & {
    status?: SlotStatus
    active: boolean
    onSelect: () => void
  }
) => {
  const { name, status = "available", active, onSelect } = props
  const orderId = useAtomValue(activeOrderIdAtom)
  const { label, dotClassName } = slotStatusOf(status)

  const tableButton = (
    <Button
      variant="ghost"
      aria-pressed={active}
      onClick={orderId ? undefined : onSelect}
      className={cn(
        "h-7 min-w-0 flex-1 justify-start gap-2 rounded px-2 text-left text-[13px] font-medium hover:bg-transparent data-[state=open]:bg-transparent",
        active ? "hover:text-primary" : "hover:text-foreground"
      )}
    >
      <span
        className={cn("size-1.5 shrink-0 rounded-full", dotClassName)}
        aria-hidden="true"
      />
      <span className="min-w-0 shrink-0 truncate">{name}</span>
      {status !== "available" && (
        <span className="ml-auto hidden min-w-0 truncate text-xs font-normal text-muted-foreground group-hover/slot:hidden xl:block">
          {label}
        </span>
      )}
      {orderId && (
        <Ellipsis
          className="hidden size-4 shrink-0 text-muted-foreground group-hover/slot:block"
          aria-hidden="true"
        />
      )}
    </Button>
  )

  return (
    <div
      title={`${name} · ${label}`}
      className={cn(
        "group/slot flex shrink-0 items-center rounded transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:bg-accent"
      )}
    >
      <SlotActions {...props}>
        {orderId ? (
          <DropdownMenuTrigger asChild>{tableButton}</DropdownMenuTrigger>
        ) : (
          <>
            {tableButton}
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`${name} · Үйлдлүүд`}
                className={cn(
                  "size-6 flex-none rounded-md opacity-0 hover:bg-foreground/10 focus-visible:opacity-100 group-hover/slot:opacity-100 data-[state=open]:bg-foreground/10 data-[state=open]:opacity-100",
                  active
                    ? "text-primary hover:text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
          </>
        )}
      </SlotActions>
    </div>
  )
}

export default Slot
