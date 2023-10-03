import { slotCodeAtom } from "@/store/order.store"
import { useAtom } from "jotai"

import { ISlot } from "@/types/slots.type"
import { LoaderIcon } from "@/components/ui/loader"
import { RadioGroup } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"

import Slot from "./components/Slot"
import useSlots from "./hooks/useSlots"

const Slots = () => {
  const { slots, loading } = useSlots()
  const [activeSlot, setActiveSlot] = useAtom(slotCodeAtom)

  return (
    <ScrollArea>
      <RadioGroup
        className="flex-col flex gap-1.5 pr-4 pt-1.5"
        value={activeSlot || ""}
        onValueChange={(value) => setActiveSlot(value)}
      >
        {loading ? (
          <LoaderIcon />
        ) : (
          <>
            {(slots || []).map((slot: ISlot) => (
              <Slot
                {...slot}
                key={slot.code}
                active={slot.code === activeSlot}
              />
            ))}
          </>
        )}
      </RadioGroup>
    </ScrollArea>
  )
}
// productsConfigs
export default Slots
