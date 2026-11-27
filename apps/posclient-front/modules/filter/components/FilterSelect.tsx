"use client"

import { useState } from "react"
import { Command as CommandPrimitive } from "cmdk"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverTrigger } from "@/components/ui/popover"

import {
  filterInputClass,
  filterItemClass,
} from "../constants/filterClassNames"
import { useFilterContext } from "../hooks/useFilterContext"
import { useFilterQueryState } from "../hooks/useFilterQueryState"
import { Filter } from "./Filter"

export type FilterOption = { value: string; label: string }

type FilterSelectProps = {
  queryKey: string
  options: FilterOption[]
  placeholder: string
}

const toSelected = (query: unknown): string | null => {
  if (Array.isArray(query)) return query.length ? String(query[0]) : null
  return query === null || query === undefined ? null : String(query)
}

const useFilterSelectValue = (queryKey: string) => {
  const { sessionKey } = useFilterContext()
  const [query, setQuery] = useFilterQueryState<string>(queryKey, sessionKey)
  const selected = toSelected(query)

  const select = (value: string) => {
    setQuery(selected === value ? null : value)
  }

  return { selected, select }
}

const OptionList = ({
  options,
  placeholder,
  selected,
  onSelect,
}: {
  options: FilterOption[]
  placeholder: string
  selected: string | null
  onSelect: (value: string) => void
}) => (
  <Command>
    <div className="border-b bg-background">
      <CommandPrimitive.Input
        autoFocus
        placeholder={placeholder}
        className={filterInputClass}
      />
    </div>
    <CommandList className="m-1 max-h-72">
      <CommandEmpty className="py-8 text-center text-[13px] text-muted-foreground">
        Олдсонгүй
      </CommandEmpty>
      {options.map((option) => {
        const checked = selected === option.value

        return (
          <CommandItem
            key={option.value}
            value={`${option.label} ${option.value}`}
            className={cn(
              filterItemClass,
              checked && "text-primary aria-selected:text-primary"
            )}
            onSelect={() => onSelect(option.value)}
          >
            <span className="truncate">{option.label}</span>
            {checked && <CheckIcon className="ml-auto text-primary" />}
          </CommandItem>
        )
      })}
    </CommandList>
  </Command>
)

export const FilterSelectView = ({
  queryKey,
  options,
  placeholder,
}: FilterSelectProps) => {
  const { resetFilterState } = useFilterContext()
  const { selected, select } = useFilterSelectValue(queryKey)

  return (
    <Filter.View filterKey={queryKey}>
      <OptionList
        options={options}
        placeholder={placeholder}
        selected={selected}
        onSelect={(value) => {
          select(value)
          resetFilterState()
        }}
      />
    </Filter.View>
  )
}

export const FilterSelectBar = ({
  queryKey,
  options,
  placeholder,
}: FilterSelectProps) => {
  const [open, setOpen] = useState(false)
  const { selected, select } = useFilterSelectValue(queryKey)
  const label =
    options.find((option) => option.value === selected)?.label || selected

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Filter.BarButton>
          <span className="truncate">{label}</span>
        </Filter.BarButton>
      </PopoverTrigger>
      <Filter.Content>
        <OptionList
          options={options}
          placeholder={placeholder}
          selected={selected}
          onSelect={(value) => {
            select(value)
            setOpen(false)
          }}
        />
      </Filter.Content>
    </Popover>
  )
}
