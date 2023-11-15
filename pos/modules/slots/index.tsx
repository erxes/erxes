import { useEffect } from "react"
import { selectedTabAtom, slotFilterAtom } from "@/store"
import { slotCodeAtom } from "@/store/order.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { ISlot } from "@/types/slots.type"

import Slot from "./components/slot"
import useSlots from "./hooks/useSlots"

const Slots = () => {
  const { slots, loading, subToSlots } = useSlots()
  const [activeSlot, setActiveSlot] = useAtom(slotCodeAtom)
  const setSlotFilter = useSetAtom(slotFilterAtom)
  const selectedTab = useAtomValue(selectedTabAtom)

  useEffect(() => {
    subToSlots()
  }, [])

  if (selectedTab === "products") return null

  return (
    <div className="w-full overflow-auto shadow-inner p-2">
      <div
        className="relative min-h-[1000px] min-w-[1000px] w-full h-full"
        style={{
          background: "white",
          backgroundImage: `radial-gradient(#d4d4d4 1px, transparent 0)`,
          backgroundSize: "10px 10px",
          backgroundPosition: "-5px -5px",
        }}
      >
        <div
          className="absolute inset-0"
          onClick={() => {
            setActiveSlot(null)
            setSlotFilter(null)
          }}
        />
        {(slots || []).map((slot: ISlot) => (
          <Slot key={slot._id} {...slot} active={activeSlot === slot.code} />
        ))}
      </div>
    </div>
  )
}

export default Slots
