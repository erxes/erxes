"use client"

import {
  Filter,
  FilterOption,
  FilterSelectBar,
  FilterSelectView,
} from "@/modules/filter"
import {
  ORDERS_FILTER_QUERY_KEYS,
  OrdersFilterQueries,
} from "@/modules/orders/hooks/useOrdersFilterVariables"
import useSlots from "@/modules/slots/hooks/useSlots"
import { allowTypesAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"
import {
  AlarmClockIcon,
  ArmchairIcon,
  ArrowUpDownIcon,
  CalendarClockIcon,
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  ListChecksIcon,
  TagIcon,
} from "lucide-react"

import { ISlot } from "@/types/slots.type"
import { ORDER_STATUSES, typeTextDef } from "@/lib/constants"
import { useMultiQueryState } from "@/lib/useQueryState"
import { Command, CommandList, CommandSeparator } from "@/components/ui/command"

import { statusText } from "./history/columns"

const SORT_OPTIONS: FilterOption[] = [
  { value: "createdAt_desc", label: "Сүүлд нэмэгдсэн" },
  { value: "createdAt_asc", label: "Эхэлж нэмэгдсэн" },
  { value: "modifiedAt_desc", label: "Сүүлд өөрчилсөн" },
  { value: "modifiedAt_asc", label: "Эхэлж өөрчилсөн" },
]

const PAID_OPTIONS: FilterOption[] = [
  { value: "paid", label: "Төлөгдсөн" },
  { value: "notPaid", label: "Төлөгдөөгүй" },
]

const LABELS = {
  statuses: "Төлөв",
  types: "Төрөл",
  sort: "Эрэмбэлэх",
  isPaid: "Төлбөр",
  slotCode: "Байрлал",
  isPreExclude: "Урьдчилсан захиалгыг нуух",
  created: "Огнооны хүрээ",
  due: "Дуусах огноо",
}

type SelectField = "statuses" | "types" | "sort" | "isPaid" | "slotCode"

const SELECT_FIELDS: {
  key: SelectField
  icon: typeof TagIcon
}[] = [
  { key: "statuses", icon: ListChecksIcon },
  { key: "types", icon: TagIcon },
  { key: "sort", icon: ArrowUpDownIcon },
  { key: "isPaid", icon: CreditCardIcon },
  { key: "slotCode", icon: ArmchairIcon },
]

const DATE_FIELDS: { key: "created" | "due"; icon: typeof TagIcon }[] = [
  { key: "created", icon: CalendarIcon },
  { key: "due", icon: CalendarClockIcon },
]

const useOrdersFilterOptions = (
  allowedStatuses: string[]
): Record<SelectField, FilterOption[]> => {
  const configTypes = useAtomValue(allowTypesAtom)
  const { slots } = useSlots()

  return {
    statuses: allowedStatuses.map((status) => ({
      value: status,
      label: statusText[status] || status,
    })),
    types: (configTypes || [])
      .filter(Boolean)
      .map((type) => ({ value: type, label: typeTextDef[type] || type })),
    sort: SORT_OPTIONS,
    isPaid: PAID_OPTIONS,
    slotCode: (slots || []).map((slot: ISlot) => ({
      value: slot.code,
      label: slot.name,
    })),
  }
}

const OrdersFilterPopover = ({
  allowedStatuses,
}: {
  allowedStatuses: string[]
}) => {
  const [queries, setQueries] = useMultiQueryState<OrdersFilterQueries>(
    ORDERS_FILTER_QUERY_KEYS
  )
  const options = useOrdersFilterOptions(allowedStatuses)

  const hasFilters = Object.values(queries).some((value) => value !== null)
  const isPreExclude = queries.isPreExclude === true

  return (
    <>
      <Filter.Popover>
        <Filter.Trigger isFiltered={hasFilters} />
        <Filter.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder="Шүүлтүүр" />
              <CommandList className="m-1 max-h-none">
                <Filter.SearchValueTrigger />
                {SELECT_FIELDS.map(({ key, icon: Icon }) => (
                  <Filter.Item
                    key={key}
                    value={key}
                    label={LABELS[key]}
                    active={queries[key] !== null}
                  >
                    <Icon />
                    {LABELS[key]}
                  </Filter.Item>
                ))}
                <Filter.CommandItem
                  value={LABELS.isPreExclude}
                  className={
                    isPreExclude
                      ? "text-primary aria-selected:text-primary"
                      : undefined
                  }
                  onSelect={() =>
                    setQueries({ isPreExclude: isPreExclude ? null : true })
                  }
                >
                  <AlarmClockIcon />
                  {LABELS.isPreExclude}
                  {isPreExclude && (
                    <CheckIcon className="ml-auto text-primary" />
                  )}
                </Filter.CommandItem>
                <CommandSeparator className="my-1" />
                {DATE_FIELDS.map(({ key, icon: Icon }) => (
                  <Filter.Item
                    key={key}
                    value={key}
                    label={LABELS[key]}
                    active={queries[key] !== null}
                  >
                    <Icon />
                    {LABELS[key]}
                  </Filter.Item>
                ))}
              </CommandList>
            </Command>
          </Filter.View>
          {SELECT_FIELDS.map(({ key }) => (
            <FilterSelectView
              key={key}
              queryKey={key}
              options={options[key]}
              placeholder={`${LABELS[key]} хайх`}
            />
          ))}
          {DATE_FIELDS.map(({ key }) => (
            <Filter.View key={key} filterKey={key}>
              <Filter.DateView filterKey={key} label={LABELS[key]} />
            </Filter.View>
          ))}
        </Filter.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
        {DATE_FIELDS.map(({ key }) => (
          <Filter.View key={key} filterKey={key} inDialog>
            <Filter.DialogDateView filterKey={key} label={LABELS[key]} />
          </Filter.View>
        ))}
      </Filter.Dialog>
    </>
  )
}

export const OrdersFilter = ({
  id,
  allowedStatuses = ORDER_STATUSES.ALL,
  children,
}: {
  id: string
  allowedStatuses?: string[]
  children?: React.ReactNode
}) => {
  const options = useOrdersFilterOptions(allowedStatuses)

  return (
    <Filter id={id} sessionKey={id}>
      <Filter.Bar>
        <OrdersFilterPopover allowedStatuses={allowedStatuses} />
        <Filter.SearchValueBarItem />
        {SELECT_FIELDS.map(({ key, icon: Icon }) => (
          <Filter.BarItem key={key} queryKey={key}>
            <Filter.BarName>
              <Icon />
              {LABELS[key]}
            </Filter.BarName>
            <FilterSelectBar
              queryKey={key}
              options={options[key]}
              placeholder={`${LABELS[key]} хайх`}
            />
          </Filter.BarItem>
        ))}
        <Filter.BarItem queryKey="isPreExclude">
          <Filter.BarName className="pr-3">
            <AlarmClockIcon />
            {LABELS.isPreExclude}
          </Filter.BarName>
        </Filter.BarItem>
        {DATE_FIELDS.map(({ key, icon: Icon }) => (
          <Filter.BarItem key={key} queryKey={key}>
            <Filter.BarName>
              <Icon />
              {LABELS[key]}
            </Filter.BarName>
            <Filter.Date filterKey={key} label={LABELS[key]} />
          </Filter.BarItem>
        ))}
        {children}
      </Filter.Bar>
    </Filter>
  )
}
