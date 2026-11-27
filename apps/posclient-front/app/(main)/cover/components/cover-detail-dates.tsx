"use client"

import { useMemo, useState } from "react"
import { PanelField, PanelSection } from "@/modules/record-side-panel"
import {
  beginDateAtom,
  coverStatusAtom,
  endDateAtom,
  terminalFetchBusyAtom,
} from "@/store/cover.store"
import { zodResolver } from "@hookform/resolvers/zod"
import { parseTime } from "@internationalized/date"
import { format } from "date-fns"
import { useAtom, useAtomValue } from "jotai"
import {
  CalendarIcon,
  ClockIcon,
  HistoryIcon,
  RefreshCwIcon,
} from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DateInput, TimeField } from "@/components/ui/time-field"

import { useCoverAmounts } from "../hooks/useCoverAmounts"
import { createCoverDatesSchema, getCoverEndDate } from "../utils/coverDates"

const FormSchema = createCoverDatesSchema()

export const COVER_DATES_FORM_ID = "cover-dates-form"

const valueClass =
  "flex h-7 w-full items-center rounded-sm px-2 text-xs tabular-nums outline-hidden transition-[color,box-shadow,background-color] hover:bg-accent focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"

const CoverTimeField = ({
  value,
  onChange,
  isDisabled,
}: {
  value: string
  onChange: (value: string) => void
  isDisabled?: boolean
}) => {
  const timeValue = useMemo(() => (value ? parseTime(value) : null), [value])

  return (
    <TimeField
      aria-label="Дуусах цаг"
      hourCycle={24}
      isDisabled={isDisabled}
      value={timeValue}
      onChange={(next) => {
        const nextValue = next ? next.toString().slice(0, 5) : ""
        if (nextValue !== value) onChange(nextValue)
      }}
    >
      <DateInput
        unstyled
        className={`${valueClass} data-[focus-within=true]:bg-accent`}
      />
    </TimeField>
  )
}

export const CoverPeriodSection = () => {
  const beginDate = useAtomValue(beginDateAtom)
  const status = useAtomValue(coverStatusAtom)
  const busy = useAtomValue(terminalFetchBusyAtom)
  const [endDate, setEndDate] = useAtom(endDateAtom)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [openedAt] = useState(() => new Date())
  const formValues = useMemo(() => {
    const end = endDate ? new Date(endDate) : openedAt
    return { endDate: end, time: format(end, "HH:mm") }
  }, [endDate, openedAt])

  const { getCoverAmounts, loading } = useCoverAmounts()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    values: formValues,
  })

  const onSubmit = ({ time, endDate }: z.infer<typeof FormSchema>) => {
    const end = getCoverEndDate(endDate, time)
    if (beginDate && end <= new Date(beginDate)) {
      form.setError("time", {
        type: "manual",
        message: `Дуусах цаг эхлэх цагаас (${format(
          new Date(beginDate),
          "yyyy.MM.dd HH:mm"
        )}) хойш байх ёстой`,
      })
      return
    }
    setEndDate(end)
    getCoverAmounts({
      variables: {
        endDate: end,
      },
    })
  }

  const locked = busy || status === "confirm" || status === "confirming"
  const errors = form.formState.errors
  const error = errors.endDate?.message || errors.time?.message

  return (
    <Form {...form}>
      <form id={COVER_DATES_FORM_ID} onSubmit={form.handleSubmit(onSubmit)}>
        <PanelSection title="Хугацаа" nested>
          <PanelField icon={HistoryIcon} label="Эхлэх">
            <span className="tabular-nums">
              {beginDate
                ? format(new Date(beginDate), "yyyy.MM.dd HH:mm")
                : "Эхний хаалт"}
            </span>
          </PanelField>
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="sr-only">Дуусах огноо</FormLabel>
                <PanelField icon={CalendarIcon} label="Дуусах огноо" bare>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <button
                          type="button"
                          disabled={locked}
                          className={valueClass}
                        >
                          {format(field.value, "yyyy.MM.dd")}
                        </button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        defaultMonth={field.value}
                        toDate={new Date()}
                        onSelect={(next) => {
                          if (next) field.onChange(next)
                          setCalendarOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </PanelField>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="sr-only">Дуусах цаг</FormLabel>
                <PanelField icon={ClockIcon} label="Дуусах цаг" bare>
                  <CoverTimeField
                    value={field.value}
                    onChange={field.onChange}
                    isDisabled={locked}
                  />
                </PanelField>
              </FormItem>
            )}
          />
          {error && (
            <p
              role="alert"
              className="px-1 text-xs font-medium text-destructive"
            >
              {error}
            </p>
          )}
          {!locked && (
            <Button
              className="mt-1 h-7 w-full gap-1.5 rounded text-xs font-medium"
              type="submit"
              loading={loading}
              variant="outline"
            >
              {!loading && (
                <RefreshCwIcon className="size-3.5" aria-hidden="true" />
              )}
              Хаалтын дүн татах
            </Button>
          )}
        </PanelSection>
      </form>
    </Form>
  )
}
