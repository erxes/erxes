import { slotCodeAtom } from "@/store/order.store"
import { gql, useQuery } from "@apollo/client"
import { useAtom } from "jotai"

import { ISlot } from "@/types/slots.type"
import { LoaderIcon } from "@/components/ui/loader"
import { RadioGroup } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"

import Slot from "./components/Slot"
import { queries } from "./graphql"

const Slots = () => {
  const { data, loading } = useQuery(gql(queries.slots))
  const { poscSlots } = data || {}
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
            {(poscSlots || []).map((slot: ISlot) => (
              <Slot {...slot} key={slot.code} active={slot.code === activeSlot} />
            ))}
          </>
        )}
      </RadioGroup>
    </ScrollArea>
  )
}
// productsConfigs
export default Slots
