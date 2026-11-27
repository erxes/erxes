import type { Select as SelectPrimitive } from "radix-ui"

import { ISlot } from "@/types/slots.type"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import useSlots from "../hooks/useSlots"

const SelectSlot = (props: SelectPrimitive.SelectProps) => {
  const { slots, loading } = useSlots()

  return (
    <Select {...props} disabled={loading}>
      <SelectTrigger className="col-span-2">
        <SelectValue placeholder="Ширээ сонгох" />
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        <ScrollArea>
          <SelectItem value="all">Бүгд</SelectItem>
          {slots?.map((slot: ISlot) => (
            <SelectItem value={slot.code} key={slot.code}>
              {slot.name}
            </SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  )
}

export default SelectSlot
