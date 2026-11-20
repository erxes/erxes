"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Command as CommandPrimitive } from "cmdk"
import { endOfDay, format, startOfDay, subDays, subMonths } from "date-fns"
import { CheckIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandItem, CommandList } from "@/components/ui/command"
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const QUARTERS = ["quarter-1", "quarter-2", "quarter-3", "quarter-4"]

const HALVES = ["half-1", "half-2"]

export const FIXED_DATES = [
  "today",
  "in-the-past",
  "last-1-day",
  "last-3-days",
  "last-7-days",
  "last-3-months",
]

const FIXED_DATE_LABELS: Record<string, string> = {
  today: "Өнөөдөр",
  "in-the-past": "Бүх хугацаанд",
  "last-1-day": "Сүүлийн 1 өдөр",
  "last-3-days": "Сүүлийн 3 өдөр",
  "last-7-days": "Сүүлийн 7 өдөр",
  "last-3-months": "Сүүлийн 3 сар",
}

const QUARTER_TOKEN = /^(\d{4})-quarter-([1-4])$/
const HALF_TOKEN = /^(\d{4})-half-([1-2])$/
const YEAR_TOKEN = /^\d{4}-y$/

const parseToken = (regex: RegExp, value: string) => {
  const match = regex.exec(value)
  if (!match) return null
  return {
    year: Number.parseInt(match[1], 10),
    part: Number.parseInt(match[2], 10),
  }
}

const getYears = () => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 13 }, (_, index) => currentYear - 7 + index)
}

const getActiveTab = (value: string) => {
  if (value.includes("half")) return "halfYear"
  if (value.includes("quarter")) return "quarter"
  if (MONTHS.some((month) => value.includes(month))) return "month"
  if (YEAR_TOKEN.test(value)) return "year"
  return "day"
}

export const parseDateRangeFromString = (
  value?: string | null
): { from: Date; to: Date } | undefined => {
  if (!value) return undefined

  const today = new Date()
  const fixedRanges: Record<string, { from: Date; to: Date }> = {
    today: { from: startOfDay(today), to: endOfDay(today) },
    "in-the-past": {
      from: startOfDay(new Date(1979, 0, 1)),
      to: endOfDay(today),
    },
    "last-1-day": { from: startOfDay(subDays(today, 1)), to: endOfDay(today) },
    "last-3-days": {
      from: startOfDay(subDays(today, 3)),
      to: endOfDay(today),
    },
    "last-7-days": {
      from: startOfDay(subDays(today, 7)),
      to: endOfDay(today),
    },
    "last-3-months": {
      from: startOfDay(subMonths(today, 3)),
      to: endOfDay(today),
    },
  }

  if (fixedRanges[value]) return fixedRanges[value]

  if (MONTHS.some((month) => value.includes(month))) {
    const [year, month] = value.split("-")
    const monthIndex = MONTHS.indexOf(month)
    return {
      from: startOfDay(new Date(Number.parseInt(year), monthIndex, 1)),
      to: endOfDay(new Date(Number.parseInt(year), monthIndex + 1, 0)),
    }
  }

  const quarter = parseToken(QUARTER_TOKEN, value)
  if (quarter) {
    return {
      from: startOfDay(new Date(quarter.year, (quarter.part - 1) * 3, 1)),
      to: endOfDay(new Date(quarter.year, quarter.part * 3, 0)),
    }
  }

  const half = parseToken(HALF_TOKEN, value)
  if (half) {
    return {
      from: startOfDay(new Date(half.year, (half.part - 1) * 6, 1)),
      to: endOfDay(new Date(half.year, half.part * 6, 0)),
    }
  }

  if (YEAR_TOKEN.test(value)) {
    const year = Number.parseInt(value)
    return {
      from: startOfDay(new Date(year, 0, 1)),
      to: endOfDay(new Date(year, 11, 31)),
    }
  }

  if (value.includes(",")) {
    const [from, to] = value.split(",")
    const fromDate = new Date(from)
    const toDate = new Date(to)
    if (Number.isNaN(fromDate.getTime())) return undefined
    return {
      from: startOfDay(fromDate),
      to: endOfDay(Number.isNaN(toDate.getTime()) ? fromDate : toDate),
    }
  }

  return undefined
}

export const getDisplayValue = (value: string) => {
  if (FIXED_DATE_LABELS[value]) return FIXED_DATE_LABELS[value]

  const monthIndex = MONTHS.findIndex((month) => value.includes(month))
  if (monthIndex > -1) return `${value.split("-")[0]} / ${monthIndex + 1}-р сар`

  const quarter = parseToken(QUARTER_TOKEN, value)
  if (quarter) return `${quarter.year} Q${quarter.part}`

  const half = parseToken(HALF_TOKEN, value)
  if (half) return `${half.year} H${half.part}`

  if (YEAR_TOKEN.test(value)) return value.replace("-y", "")

  if (value.includes(",")) {
    const [from, to] = value.split(",")
    return `${format(new Date(from), "yyyy.MM.dd")} - ${format(new Date(to), "yyyy.MM.dd")}`
  }

  return ""
}

export const DateFilterCommand = ({
  selected,
  label,
  onSelect,
  onCustom,
}: {
  selected: string
  label: string
  onSelect: (value: string) => void
  onCustom: () => void
}) => (
  <Command className="[&_[cmdk-input-wrapper]]:hidden">
    <div className="border-b bg-background">
      <CommandPrimitive.Input
        autoFocus
        placeholder={label}
        className="flex h-8 w-full rounded-md bg-transparent px-3 text-[13px] font-medium outline-hidden placeholder:text-muted-foreground/70"
      />
    </div>
    <CommandList className="m-1 max-h-72">
      {FIXED_DATES.map((date) => (
        <CommandItem
          key={date}
          value={date + FIXED_DATE_LABELS[date]}
          onSelect={() => onSelect(date)}
          className={cn(
            "h-8 gap-2 rounded-sm text-[13px] font-medium",
            selected === date && "text-primary"
          )}
        >
          {FIXED_DATE_LABELS[date]}
          {selected === date && (
            <CheckIcon className="ml-auto h-4 w-4 text-primary" />
          )}
        </CommandItem>
      ))}
      <CommandItem
        value="custom-date-or-timeframe"
        onSelect={onCustom}
        className="h-8 gap-2 rounded-sm text-[13px] font-medium"
      >
        Огноо, хугацаа сонгох...
      </CommandItem>
    </CommandList>
  </Command>
)

export const DateRangeDialogContent = ({
  label,
  value,
  onApply,
  onCancel,
}: {
  label: string
  value?: string | null
  onApply: (value: string) => void
  onCancel: () => void
}) => {
  const [tab, setTab] = useState(() => (value ? getActiveTab(value) : "day"))
  const [currentRange, setCurrentRange] = useState<DateRange | undefined>(() =>
    parseDateRangeFromString(value)
  )
  const [currentValue, setCurrentValue] = useState<string | null>(value ?? null)

  const handleCalendarChange = (range: DateRange | undefined) => {
    setCurrentRange(range)
    if (!range?.from) {
      setCurrentValue(null)
      return
    }
    const to = range.to ?? range.from
    setCurrentValue(`${range.from.toISOString()},${to.toISOString()}`)
  }

  return (
    <DialogContent className="max-w-xl gap-0 p-0">
      <Tabs value={tab} onValueChange={setTab}>
        <DialogHeader className="space-y-3 p-6">
          <DialogTitle className="text-sm font-semibold">{label}</DialogTitle>
          <div>
            <TabsList className="h-8">
              <TabsTrigger value="day">Өдөр</TabsTrigger>
              <TabsTrigger value="month">Сар</TabsTrigger>
              <TabsTrigger value="quarter">Улирал</TabsTrigger>
              <TabsTrigger value="halfYear">Хагас жил</TabsTrigger>
              <TabsTrigger value="year">Жил</TabsTrigger>
            </TabsList>
          </div>
        </DialogHeader>
        <div className="flex h-88 justify-center overflow-auto border-y border-muted py-6">
          <TabsContent value="day" className="mt-0 self-center">
            <Calendar
              mode="range"
              numberOfMonths={2}
              showOutsideDays
              fixedWeeks
              defaultMonth={currentRange?.from}
              selected={currentRange}
              onSelect={handleCalendarChange}
            />
          </TabsContent>
          <TabsContent value="month" className="mt-0 w-full">
            <DateFilterRadioGroup
              items={MONTHS}
              value={currentValue}
              onValueChange={setCurrentValue}
              className="grid grid-cols-2"
            />
          </TabsContent>
          <TabsContent value="quarter" className="mt-0 w-full">
            <DateFilterRadioGroup
              items={QUARTERS}
              value={currentValue}
              onValueChange={setCurrentValue}
              className="flex flex-col"
            />
          </TabsContent>
          <TabsContent value="halfYear" className="mt-0 w-full">
            <DateFilterRadioGroup
              items={HALVES}
              value={currentValue}
              onValueChange={setCurrentValue}
              className="flex flex-col"
            />
          </TabsContent>
          <TabsContent value="year" className="mt-0 w-full">
            <DateFilterRadioGroup
              value={currentValue}
              onValueChange={setCurrentValue}
              className="flex flex-col"
            />
          </TabsContent>
        </div>
        <DialogFooter className="p-6">
          <Button
            type="button"
            variant="ghost"
            className="h-8 rounded px-3 text-[13px] font-semibold"
            onClick={onCancel}
          >
            Болих
          </Button>
          <Button
            type="button"
            className="h-8 rounded px-3 text-[13px] font-semibold"
            disabled={!currentValue}
            onClick={() => currentValue && onApply(currentValue)}
          >
            Хэрэглэх
          </Button>
        </DialogFooter>
      </Tabs>
    </DialogContent>
  )
}

const itemLabel = (item: string) => {
  const monthIndex = MONTHS.indexOf(item)
  if (monthIndex > -1) return `${monthIndex + 1}-р сар`
  if (item.startsWith("quarter")) return `${item.split("-")[1]}-р улирал`
  if (item.startsWith("half")) return `${item.split("-")[1]}-р хагас`
  return item
}

const DateFilterRadioGroup = ({
  items,
  className,
  value,
  onValueChange,
}: {
  items?: string[]
  className: string
  value: string | null
  onValueChange: (value: string) => void
}) => {
  const id = useId()

  return (
    <RadioGroup asChild value={value || ""} onValueChange={onValueChange}>
      <fieldset className={cn("w-full gap-6 px-6 pb-6", className)}>
        {getYears().map((year) =>
          items ? (
            <div className="flex flex-col gap-3" key={year}>
              <legend className="text-sm font-semibold leading-none">
                {year}
              </legend>
              <div
                className={cn(
                  "grid gap-1",
                  items.length === 12 && "grid-cols-3",
                  items.length === 2 && "grid-cols-2",
                  items.length === 4 && "grid-cols-4"
                )}
              >
                {items.map((item) => (
                  <DateFilterRadioGroupItem
                    id={id}
                    key={item}
                    value={`${year}-${item}`}
                    currentValue={value}
                  >
                    {itemLabel(item)}
                  </DateFilterRadioGroupItem>
                ))}
              </div>
            </div>
          ) : (
            <DateFilterRadioGroupItem
              id={id}
              key={year}
              value={`${year}-y`}
              currentValue={value}
            >
              {year}
            </DateFilterRadioGroupItem>
          )
        )}
      </fieldset>
    </RadioGroup>
  )
}

const DateFilterRadioGroupItem = ({
  id,
  value,
  children,
  currentValue,
}: {
  id: string
  value: string
  children: React.ReactNode
  currentValue: string | null
}) => {
  const ref = useRef<HTMLLabelElement>(null)

  useEffect(() => {
    if (currentValue !== value) return
    const timer = setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "instant", block: "center" })
    }, 100)
    return () => clearTimeout(timer)
  }, [currentValue, value])

  return (
    <label
      ref={ref}
      htmlFor={`${id}-${value}`}
      className={cn(
        "relative inline-flex h-8 cursor-pointer items-center justify-center rounded bg-accent px-3 text-[13px] font-medium transition-colors hover:bg-border",
        currentValue === value &&
          "bg-primary text-primary-foreground hover:bg-primary"
      )}
    >
      <RadioGroupItem value={value} id={`${id}-${value}`} className="sr-only" />
      {children}
    </label>
  )
}
