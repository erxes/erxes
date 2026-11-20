import { allowTypesAtom } from "@/store/config.store"
import { orderTypeAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { IOrderType } from "@/types/order.types"
import { typeTextDef } from "@/lib/constants"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ChooseType = () => {
  const types = useAtomValue(allowTypesAtom)
  const [type, setType] = useAtom(orderTypeAtom)
  return (
    <Select value={type} onValueChange={(value: IOrderType) => setType(value)}>
      <SelectTrigger className="h-12 rounded-xl bg-foreground text-center text-sm font-semibold text-background shadow-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {(types || [])
            .filter((tp) => !!tp)
            .map((tp) => (
              <SelectItem value={tp} key={tp}>
                {typeTextDef[tp]}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default ChooseType
