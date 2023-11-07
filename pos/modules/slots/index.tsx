import { slotCodeAtom } from "@/store/order.store"
import { useAtom } from "jotai"

import { ISlot } from "@/types/slots.type"
import { RadioGroup } from "@/components/ui/radio-group"

import Slot from "./components/slot"
import useSlots from "./hooks/useSlots"

const Slots = () => {
  const { slots, loading } = useSlots()
  const [activeSlot, setActiveSlot] = useAtom(slotCodeAtom)
  return (
    <div className="w-full overflow-auto shadow-inner p-2">
      <RadioGroup
        className="relative min-h-[1000px] min-w-[1000px] w-full h-full"
        style={{
          background: "white",
          backgroundImage: `radial-gradient(#d4d4d4 1px, transparent 0)`,
          backgroundSize: "10px 10px",
          backgroundPosition: "-5px -5px",
        }}
        value={activeSlot || ""}
        onValueChange={(value) => setActiveSlot(value)}
      >
        {(slots || []).map((slot: ISlot) => (
          <Slot key={slot._id} {...slot} active={activeSlot === slot.code} />
        ))}
      </RadioGroup>
    </div>
  )
}

export default Slots
