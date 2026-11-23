import { useEffect } from "react"
import { selectedTabAtom } from "@/store"
import { useAtomValue } from "jotai"

import { ISlot } from "@/types/slots.type"
import Loader from "@/components/ui/loader"

import Slot from "./components/slot"
import useSlots from "./hooks/useSlots"

const Slots = () => {
  const { slots, loading, subToSlots } = useSlots()
  const selectedTab = useAtomValue(selectedTabAtom)

  useEffect(() => {
    subToSlots()
  }, [])

  if (selectedTab === "products") {
    return null
  }

  return (
    <div className="relative mb-16 w-full flex-auto overflow-auto rounded-2xl border bg-background p-2 shadow-xs">
      <div
        className="relative min-h-[1000px] min-w-[1000px] w-full h-full"
        style={{
          backgroundImage: `radial-gradient(hsl(var(--border)) 1px, transparent 0)`,
          backgroundSize: "10px 10px",
          backgroundPosition: "-5px -5px",
        }}
      >
        {(slots || []).map((slot: ISlot) => (
          <Slot key={slot._id} {...slot} />
        ))}
      </div>
      {loading && <Loader className="absolute inset-0" />}
    </div>
  )
}

export default Slots
