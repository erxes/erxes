import { Command as CommandPrimitive } from "cmdk"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Command, CommandItem, CommandList } from "@/components/ui/command"

import {
  filterInputClass,
  filterItemClass,
} from "../../constants/filterClassNames"
import { useFilterContext } from "../../hooks/useFilterContext"
import { FIXED_DATES } from "../constants/dateTypes"
import { normalizeFixedDate } from "../utils/dateTokens"
import { getDisplayValue } from "../utils/getDisplayValue"

export const DateFilterCommand = ({
  value,
  selected,
  onSelect,
  focusOnMount,
  label,
}: {
  value: string
  selected: string
  onSelect: (value: string | null) => void
  focusOnMount?: boolean
  label?: string
}) => {
  const { setDialogView, setOpenDialog, setOpen } = useFilterContext()
  const displayLabel = label ?? "Огноо"
  const selectedDate = normalizeFixedDate(selected)

  return (
    <Command>
      <div className="border-b bg-background">
        <CommandPrimitive.Input
          autoFocus={focusOnMount}
          placeholder={displayLabel}
          className={filterInputClass}
        />
      </div>
      <CommandList className="m-1 max-h-72">
        {FIXED_DATES.map((date) => (
          <CommandItem
            key={date}
            value={`${date} ${getDisplayValue(date)}`}
            onSelect={() => {
              onSelect(date)
            }}
            className={cn(
              filterItemClass,
              selectedDate === date && "text-primary aria-selected:text-primary"
            )}
          >
            {getDisplayValue(date)}
            {selectedDate === date && (
              <CheckIcon className="ml-auto text-primary" />
            )}
          </CommandItem>
        ))}
        <CommandItem
          className={filterItemClass}
          value="custom-date-or-timeframe"
          onSelect={() => {
            setOpen(false)
            setDialogView(value)
            setOpenDialog(true)
          }}
        >
          {`${displayLabel} сонгох...`}
        </CommandItem>
      </CommandList>
    </Command>
  )
}
