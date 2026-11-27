import { useEffect, useId, useRef, useState } from "react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  filterDialogButtonClass,
  filterDialogClass,
  filterDialogOverlayClass,
} from "../../constants/filterClassNames"
import { useFilterContext } from "../../hooks/useFilterContext"
import { useFilterQueryState } from "../../hooks/useFilterQueryState"
import { HALVES, MONTHS, QUARTERS } from "../constants/dateTypes"
import { getActiveTab } from "../utils/getActiveTab"
import { getYearsArray } from "../utils/getYears"
import { parseDateRangeFromString } from "../utils/parseDateRangeFromString"

export const FilterDialogDateView = ({
  filterKey,
  label,
}: {
  filterKey: string
  label?: string
}) => {
  const { sessionKey, resetFilterState } = useFilterContext()
  const [value, setValue] = useFilterQueryState<string>(filterKey, sessionKey)

  return (
    <DateRangeDialogContent
      label={label ?? filterKey}
      value={value}
      onCancel={resetFilterState}
      onApply={(nextValue) => {
        setValue(nextValue)
        resetFilterState()
      }}
    />
  )
}

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
  const [tabs, setTabs] = useState(() => (value ? getActiveTab(value) : "day"))
  const [currentDateRange, setCurrentDateRange] = useState<
    DateRange | undefined
  >(() => parseDateRangeFromString(value))
  const [currentValue, setCurrentValue] = useState<string | null>(value ?? null)

  const handleCalendarChange = (range: DateRange | undefined) => {
    setCurrentDateRange(range)

    if (!range?.from) {
      setCurrentValue(null)
      return
    }
    const to = range.to ?? range.from
    setCurrentValue(`${range.from.toISOString()},${to.toISOString()}`)
  }

  const handleApply = () => {
    if (currentValue) {
      onApply(currentValue)
    }
  }

  return (
    <DialogContent
      hideClose
      overlayClassName={filterDialogOverlayClass}
      className={cn(filterDialogClass, "max-w-xl gap-0 p-0")}
    >
      <Tabs value={tabs} onValueChange={setTabs}>
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
          <TabsContent value="day" className="mt-0 self-center outline-hidden">
            <Calendar
              mode="range"
              numberOfMonths={2}
              showOutsideDays
              fixedWeeks
              defaultMonth={currentDateRange?.from}
              selected={currentDateRange}
              onSelect={handleCalendarChange}
            />
          </TabsContent>
          <TabsContent value="month" className="mt-0 w-full outline-hidden">
            <DateFilterRadioGroup
              items={MONTHS}
              onValueChange={setCurrentValue}
              value={currentValue}
              className="grid grid-cols-2"
            />
          </TabsContent>
          <TabsContent value="quarter" className="mt-0 w-full outline-hidden">
            <DateFilterRadioGroup
              items={QUARTERS}
              className="flex flex-col"
              onValueChange={setCurrentValue}
              value={currentValue}
            />
          </TabsContent>
          <TabsContent value="halfYear" className="mt-0 w-full outline-hidden">
            <DateFilterRadioGroup
              items={HALVES}
              className="flex flex-col"
              onValueChange={setCurrentValue}
              value={currentValue}
            />
          </TabsContent>
          <TabsContent value="year" className="mt-0 w-full outline-hidden">
            <DateFilterRadioGroup
              className="flex flex-col"
              onValueChange={setCurrentValue}
              value={currentValue}
            />
          </TabsContent>
        </div>
        <DialogFooter className="p-6">
          <Button
            type="button"
            variant="ghost"
            className={filterDialogButtonClass}
            onClick={onCancel}
          >
            Болих
          </Button>
          <Button
            type="button"
            className={filterDialogButtonClass}
            disabled={!currentValue}
            onClick={handleApply}
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
        {getYearsArray(7, 5).map((year) =>
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
                    value={`${year}-${item}`}
                    key={item}
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
              value={`${year}-y`}
              key={year}
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
        "relative inline-flex h-8 cursor-pointer items-center justify-center rounded bg-accent px-3 text-[13px] font-medium transition-colors hover:bg-border has-focus-visible:outline-2 has-focus-visible:outline-ring/70 has-focus-visible:outline-solid",
        currentValue === value &&
          "bg-primary text-primary-foreground hover:bg-primary"
      )}
    >
      <RadioGroupItem value={value} id={`${id}-${value}`} className="sr-only" />
      {children}
    </label>
  )
}
