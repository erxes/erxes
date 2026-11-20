"use client"

import { useState } from "react"
import useSlots from "@/modules/slots/hooks/useSlots"
import { SetAtom } from "@/store"
import { allowTypesAtom } from "@/store/config.store"
import { defaultFilter } from "@/store/history.store"
import { formatISO, setHours, setMinutes, setSeconds } from "date-fns"
import { SetStateAction, useAtomValue } from "jotai"
import {
  AlarmClockIcon,
  ArmchairIcon,
  ArrowUpDownIcon,
  CalendarClockIcon,
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  ListChecksIcon,
  LucideIcon,
  TagIcon,
} from "lucide-react"

import { IFilter } from "@/types/history.types"
import { IOrderStatus } from "@/types/order.types"
import { ISlot } from "@/types/slots.type"
import { ORDER_STATUSES, typeTextDef } from "@/lib/constants"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { parseDateRangeFromString } from "@/components/ui/filter/date-filter"
import {
  filterItemClass,
  Filter as FilterRoot,
  FilterValue,
  useFilterContext,
  useFilterValue,
} from "@/components/ui/filter/filter"
import { Popover, PopoverTrigger } from "@/components/ui/popover"

type Option = { value: string; label: string }

const DEFAULT_SORT = `${defaultFilter.sortField}_${
  defaultFilter.sortDirection === 1 ? "asc" : "desc"
}`

const SORT_OPTIONS: Option[] = [
  { value: "createdAt_desc", label: "Сүүлд нэмэгдсэн" },
  { value: "createdAt_asc", label: "Эхэлж нэмэгдсэн" },
  { value: "modifiedAt_desc", label: "Сүүлд өөрчилсөн" },
  { value: "modifiedAt_asc", label: "Эхэлж өөрчилсөн" },
]

const PAID_OPTIONS: Option[] = [
  { value: "paid", label: "Төлөгдсөн" },
  { value: "notPaid", label: "Төлөгдөөгүй" },
]

const PRE_EXCLUDE = "true"

const toEnd = (d: string | Date) =>
  setHours(setMinutes(setSeconds(new Date(d), 59), 59), 23)

const asString = (value: FilterValue) =>
  typeof value === "string" ? value : undefined

const asList = (value: FilterValue) => (Array.isArray(value) ? value : [])

const Filter = ({
  filter,
  setFilter,
  loading,
  allowedStatuses,
  children,
}: {
  filter: IFilter
  setFilter: SetAtom<[SetStateAction<IFilter>], void>
  loading?: boolean
  allowedStatuses?: string[]
  children?: React.ReactNode
}) => {
  const configTypes = useAtomValue(allowTypesAtom)
  const { slots } = useSlots()
  const [values, setValues] = useState<Record<string, FilterValue>>({})

  const statusOptions: Option[] = (allowedStatuses || ORDER_STATUSES.ALL).map(
    (status) => ({ value: status, label: status })
  )
  const typeOptions: Option[] = (configTypes || [])
    .filter(Boolean)
    .map((tp) => ({ value: tp, label: typeTextDef[tp] || tp }))
  const slotOptions: Option[] = (slots || []).map((slot: ISlot) => ({
    value: slot.code,
    label: slot.name,
  }))

  const toFilter = (next: Record<string, FilterValue>): IFilter => {
    const range = parseDateRangeFromString(asString(next.createdDateRange))
    const dueRange = parseDateRangeFromString(asString(next.dueDateRange))
    const sort = asString(next.sort) || DEFAULT_SORT
    const statuses = asList(next.statuses)
    const isPaid = asString(next.isPaid)

    return {
      ...filter,
      page: 1,
      searchValue: asString(next.searchValue) || "",
      statuses: (statuses.length
        ? statuses
        : allowedStatuses || ORDER_STATUSES.ALL) as IOrderStatus[],
      types: asList(next.types),
      startDate: formatISO(range?.from || new Date(defaultFilter.startDate)),
      endDate: formatISO(toEnd(range?.to || new Date(defaultFilter.endDate))),
      isPaid: isPaid ? isPaid === "paid" : undefined,
      slotCode: asString(next.slotCode),
      isPreExclude: next.isPreExclude === PRE_EXCLUDE,
      sortField: sort.split("_")[0],
      sortDirection: sort.split("_")[1] === "asc" ? 1 : -1,
      dueStartDate: dueRange?.from ? formatISO(dueRange.from) : undefined,
      dueEndDate: dueRange?.to ? formatISO(toEnd(dueRange.to)) : undefined,
    }
  }

  const onValueChange = (key: string, value: FilterValue) => {
    const next = { ...values, [key]: value }
    setValues(next)
    setFilter(toFilter(next))
  }

  const isFiltered = Object.values(values).some((value) => value !== null)
  const isActive = (key: string) => values[key] !== null && !!values[key]

  return (
    <FilterRoot values={values} onValueChange={onValueChange}>
      <FilterRoot.Bar>
        <FilterRoot.Popover>
          <FilterRoot.Trigger isFiltered={isFiltered} disabled={loading} />
          <FilterRoot.Content>
            <FilterRoot.View>
              <Command>
                <FilterRoot.CommandInput placeholder="Шүүлтүүр" hotkey />
                <CommandList className="m-1 max-h-none">
                  <FilterRoot.SearchValueTrigger />
                  <FilterItem field="statuses" active={isActive("statuses")} />
                  <FilterItem field="types" active={isActive("types")} />
                  <FilterItem field="sort" active={isActive("sort")} />
                  <FilterItem field="isPaid" active={isActive("isPaid")} />
                  <FilterItem field="slotCode" active={isActive("slotCode")} />
                  <FilterRoot.CommandItem
                    value={FIELDS.isPreExclude.label}
                    className={cn(isActive("isPreExclude") && "text-primary")}
                    onSelect={() =>
                      onValueChange(
                        "isPreExclude",
                        isActive("isPreExclude") ? null : PRE_EXCLUDE
                      )
                    }
                  >
                    <AlarmClockIcon />
                    {FIELDS.isPreExclude.label}
                    {isActive("isPreExclude") && (
                      <CheckIcon className="ml-auto text-primary" />
                    )}
                  </FilterRoot.CommandItem>
                  <CommandSeparator className="my-1" />
                  <FilterItem
                    field="createdDateRange"
                    active={isActive("createdDateRange")}
                  />
                  <FilterItem
                    field="dueDateRange"
                    active={isActive("dueDateRange")}
                  />
                </CommandList>
              </Command>
            </FilterRoot.View>
            <FilterRoot.View filterKey="statuses">
              <OptionsView field="statuses" options={statusOptions} multiple />
            </FilterRoot.View>
            <FilterRoot.View filterKey="types">
              <OptionsView field="types" options={typeOptions} multiple />
            </FilterRoot.View>
            <FilterRoot.View filterKey="sort">
              <OptionsView field="sort" options={SORT_OPTIONS} />
            </FilterRoot.View>
            <FilterRoot.View filterKey="isPaid">
              <OptionsView field="isPaid" options={PAID_OPTIONS} />
            </FilterRoot.View>
            <FilterRoot.View filterKey="slotCode">
              <OptionsView field="slotCode" options={slotOptions} />
            </FilterRoot.View>
            <FilterRoot.View filterKey="createdDateRange">
              <FilterRoot.DateView
                filterKey="createdDateRange"
                label={FIELDS.createdDateRange.label}
              />
            </FilterRoot.View>
            <FilterRoot.View filterKey="dueDateRange">
              <FilterRoot.DateView
                filterKey="dueDateRange"
                label={FIELDS.dueDateRange.label}
              />
            </FilterRoot.View>
          </FilterRoot.Content>
        </FilterRoot.Popover>
        <FilterRoot.Dialog>
          <FilterRoot.View filterKey="searchValue" inDialog>
            <FilterRoot.DialogStringView filterKey="searchValue" />
          </FilterRoot.View>
          <FilterRoot.View filterKey="createdDateRange" inDialog>
            <FilterRoot.DialogDateView
              filterKey="createdDateRange"
              label={FIELDS.createdDateRange.label}
            />
          </FilterRoot.View>
          <FilterRoot.View filterKey="dueDateRange" inDialog>
            <FilterRoot.DialogDateView
              filterKey="dueDateRange"
              label={FIELDS.dueDateRange.label}
            />
          </FilterRoot.View>
        </FilterRoot.Dialog>
        <FilterRoot.SearchValueBarItem />
        <OptionsBarItem field="statuses" options={statusOptions} multiple />
        <OptionsBarItem field="types" options={typeOptions} multiple />
        <OptionsBarItem field="sort" options={SORT_OPTIONS} />
        <OptionsBarItem field="isPaid" options={PAID_OPTIONS} />
        <OptionsBarItem field="slotCode" options={slotOptions} />
        <FilterRoot.BarItem queryKey="isPreExclude">
          <FilterRoot.BarName className="pr-3">
            <AlarmClockIcon />
            {FIELDS.isPreExclude.label}
          </FilterRoot.BarName>
        </FilterRoot.BarItem>
        <DateBarItem field="createdDateRange" />
        <DateBarItem field="dueDateRange" />
        {children}
      </FilterRoot.Bar>
    </FilterRoot>
  )
}

const FIELDS: Record<string, { label: string; icon: LucideIcon }> = {
  statuses: { label: "Төлөв", icon: ListChecksIcon },
  types: { label: "Төрөл", icon: TagIcon },
  sort: { label: "Эрэмблэх", icon: ArrowUpDownIcon },
  isPaid: { label: "Төлбөр", icon: CreditCardIcon },
  slotCode: { label: "Байрлал", icon: ArmchairIcon },
  isPreExclude: { label: "Урьдчилсан захиалгыг нуух", icon: AlarmClockIcon },
  createdDateRange: { label: "Огнооны хүрээ", icon: CalendarIcon },
  dueDateRange: { label: "Дуусах огноо", icon: CalendarClockIcon },
}

const FilterItem = ({ field, active }: { field: string; active: boolean }) => {
  const { label, icon: Icon } = FIELDS[field]

  return (
    <FilterRoot.Item value={field} label={label} active={active}>
      <Icon />
      {label}
    </FilterRoot.Item>
  )
}

const OptionsCommand = ({
  options,
  selected,
  label,
  onSelect,
}: {
  options: Option[]
  selected: string[]
  label: string
  onSelect: (value: string) => void
}) => (
  <Command>
    <FilterRoot.CommandInput placeholder={`${label} хайх`} />
    <CommandEmpty className="py-8 text-center text-[13px] text-muted-foreground">
      Олдсонгүй
    </CommandEmpty>
    <CommandList className="m-1 max-h-72">
      {options.map((option) => (
        <CommandItem
          key={option.value}
          value={option.label + " " + option.value}
          className={filterItemClass}
          onSelect={() => onSelect(option.value)}
        >
          {option.label}
          {selected.includes(option.value) && (
            <CheckIcon className="ml-auto text-primary" />
          )}
        </CommandItem>
      ))}
    </CommandList>
  </Command>
)

const useOptionSelect = (field: string, multiple?: boolean) => {
  const [value, setValue] = useFilterValue(field)
  const selected = multiple ? asList(value) : value ? [String(value)] : []

  const select = (option: string) => {
    if (!multiple) {
      setValue(selected.includes(option) ? null : option)
      return
    }
    setValue(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option]
    )
  }

  return { selected, select }
}

const OptionsView = ({
  field,
  options,
  multiple,
}: {
  field: string
  options: Option[]
  multiple?: boolean
}) => {
  const { resetFilterState } = useFilterContext()
  const { selected, select } = useOptionSelect(field, multiple)

  return (
    <OptionsCommand
      options={options}
      selected={selected}
      label={FIELDS[field].label}
      onSelect={(value) => {
        select(value)
        if (!multiple) resetFilterState()
      }}
    />
  )
}

const OptionsBarItem = ({
  field,
  options,
  multiple,
}: {
  field: string
  options: Option[]
  multiple?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const { selected, select } = useOptionSelect(field, multiple)
  const { label, icon: Icon } = FIELDS[field]
  const labels = selected.map(
    (value) => options.find((option) => option.value === value)?.label || value
  )

  return (
    <FilterRoot.BarItem queryKey={field}>
      <FilterRoot.BarName>
        <Icon />
        {label}
      </FilterRoot.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FilterRoot.BarButton>
            <span className="truncate">
              {labels.length > 2
                ? `${labels.length} ${label.toLowerCase()}`
                : labels.join(", ")}
            </span>
          </FilterRoot.BarButton>
        </PopoverTrigger>
        <FilterRoot.Content>
          <OptionsCommand
            options={options}
            selected={selected}
            label={label}
            onSelect={(value) => {
              select(value)
              if (!multiple) setOpen(false)
            }}
          />
        </FilterRoot.Content>
      </Popover>
    </FilterRoot.BarItem>
  )
}

const DateBarItem = ({ field }: { field: string }) => {
  const { label, icon: Icon } = FIELDS[field]

  return (
    <FilterRoot.BarItem queryKey={field}>
      <FilterRoot.BarName>
        <Icon />
        {label}
      </FilterRoot.BarName>
      <FilterRoot.Date filterKey={field} label={label} />
    </FilterRoot.BarItem>
  )
}

export default Filter
