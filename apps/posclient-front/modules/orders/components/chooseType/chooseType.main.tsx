import { allowTypesAtom } from "@/store/config.store"
import { orderTypeAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { IOrderType } from "@/types/order.types"
import { typeTextDef } from "@/lib/constants"
import { cn } from "@/lib/utils"
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
  const options = (types || []).filter((tp) => !!tp)

  if (options.length > 1 && options.length <= 4) {
    return (
      <div
        role="radiogroup"
        aria-label="Захиалгын төрөл"
        className="col-span-2 grid auto-cols-fr grid-flow-col gap-0.5 rounded-md bg-foreground/5 p-0.5"
      >
        {options.map((tp) => (
          <button
            key={tp}
            type="button"
            role="radio"
            aria-checked={type === tp}
            onClick={() => setType(tp as IOrderType)}
            className={cn(
              "h-7 truncate rounded px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:shadow-focus focus-visible:outline-hidden",
              type === tp && "bg-background text-foreground shadow-xs"
            )}
          >
            {typeTextDef[tp]}
          </button>
        ))}
      </div>
    )
  }

  return (
    <Select value={type} onValueChange={(value: IOrderType) => setType(value)}>
      <SelectTrigger className="col-span-2 h-8 rounded border-0 bg-background px-2.5 text-[13px] font-medium shadow-xs focus:shadow-focus">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((tp) => (
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
