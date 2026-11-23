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
      className="flex shrink-0 items-center gap-2 overflow-hidden border-b bg-sidebar px-2 py-1.5 text-foreground xl:w-56 xl:flex-col xl:items-stretch xl:gap-0 xl:border-b-0 xl:border-r xl:p-0"
    >
      <div className="flex shrink-0 items-center xl:h-10 xl:px-2">
        <h2 className="min-w-0 flex-1 truncate px-1 text-[13px] font-medium xl:px-2">
          Ширээ
        </h2>
        <span className="hidden h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-muted-foreground xl:flex">
          {tables.length}
        </span>
      </div>
      <div className="hidden h-6 shrink-0 items-center px-4 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground xl:flex">
        Бүх ширээ
      </div>
      <div className="flex min-w-0 gap-1 overflow-auto xl:min-h-0 xl:flex-1 xl:flex-col xl:px-2 xl:pb-1">
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
      {!loading && (
        <div className="hidden shrink-0 flex-col gap-1 border-t px-4 py-2.5 xl:flex">
          {SLOT_STATUSES.map(({ value, label, dotClassName }) => (
            <div
              key={value}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span
                className={cn("size-1.5 rounded-full", dotClassName)}
                aria-hidden="true"
              />
              <span className="flex-1">{label}</span>
              <span className="font-medium tabular-nums text-foreground">
                {countOf(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}

export default Slots
