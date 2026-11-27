import { useEffect } from "react"
import { slotFilterAtom } from "@/store"
import { slotCodeAtom } from "@/store/order.store"
import { useAtom, useSetAtom } from "jotai"

import { ISlot } from "@/types/slots.type"
import { cn } from "@/lib/utils"
import { LoaderIcon } from "@/components/ui/loader"

import Slot from "./components/slot.main"
import useSlots from "./hooks/useSlots"
import { SLOT_STATUSES, SlotStatus } from "./slotStatuses"

type SlotWithStatus = ISlot & { status?: SlotStatus }

const Slots = () => {
  const { slots, loading, subToSlots } = useSlots()
  const [activeSlot, setActiveSlot] = useAtom(slotCodeAtom)
  const setSlotFilter = useSetAtom(slotFilterAtom)
  const tables: SlotWithStatus[] = (slots || []).filter(
    (slot: ISlot) => !slot.option?.isShape
  )
  useEffect(() => subToSlots(), [subToSlots])

  if (!loading && !tables.length) return null

  const selectTable = (code: string) => {
    const next = activeSlot === code ? "" : code
    setActiveSlot(next)
    setSlotFilter(next)
  }

  const countOf = (status: SlotStatus) =>
    tables.filter((table) => (table.status || "available") === status).length

  return (
    <aside
      aria-label="Ширээ"
      className="flex shrink-0 items-center gap-2 overflow-hidden border-b bg-background px-2 py-1.5 text-foreground xl:w-52 xl:flex-col xl:items-stretch xl:gap-0 xl:border-b-0 xl:border-r xl:p-0"
    >
      <div className="flex shrink-0 items-center gap-2 xl:h-10 xl:border-b xl:px-3">
        <h2 className="min-w-0 flex-1 truncate text-[13px] font-medium">
          Ширээ
        </h2>
        {!loading && (
          <div className="hidden items-center gap-2 xl:flex">
            {SLOT_STATUSES.map(({ value, label, dotClassName }) => (
              <span
                key={value}
                title={label}
                className="flex items-center gap-1 text-xs font-medium tabular-nums text-muted-foreground"
              >
                <span
                  className={cn("size-1.5 rounded-full", dotClassName)}
                  aria-hidden="true"
                />
                <span className="sr-only">{label}</span>
                {countOf(value)}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex min-w-0 gap-1 overflow-auto xl:min-h-0 xl:flex-1 xl:flex-col xl:p-2">
        {loading ? (
          <LoaderIcon />
        ) : (
          tables.map((slot) => (
            <Slot
              key={slot.code}
              {...slot}
              active={activeSlot === slot.code}
              onSelect={() => selectTable(slot.code)}
            />
          ))
        )}
      </div>
    </aside>
  )
}

export default Slots
