"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Filter,
  filterDialogButtonClass,
  filterDialogClass,
  filterDialogOverlayClass,
  filterInputClass,
  filterItemClass,
  FilterOption,
  FilterSelectBar,
  FilterSelectView,
  parseDateRangeFromString,
  useFilterContext,
  useFilterQueryState,
} from "@/modules/filter"
import { reportEndDateAtom, reportStartDateAtom } from "@/store"
import { currentUserAtom } from "@/store/config.store"
import { LazyQueryExecFunction, useQuery } from "@apollo/client"
import { parseTime } from "@internationalized/date"
import { Command as CommandPrimitive } from "cmdk"
import { endOfDay, startOfDay } from "date-fns"
import { useAtomValue, useSetAtom } from "jotai"
import {
  CalendarCogIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react"

import type { Customer } from "@/types/customer.types"
import { useMultiQueryState } from "@/lib/useQueryState"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DateInput, TimeField } from "@/components/ui/time-field"
import { onError } from "@/components/ui/use-toast"

import { queries } from "../graphql"
import { combineDateTime } from "../utils/date"
import { DailyReport } from "./summary"

interface DailyReportResponse {
  dailyReport: {
    report: DailyReport
  }
}

interface ReportVariables {
  posUserIds?: string[]
  dateType?: string
  startDate: Date
  endDate: Date
}

interface ReportFormProps {
  getReport: LazyQueryExecFunction<DailyReportResponse, ReportVariables>
  loading: boolean
}

type ReportFilterQueries = {
  users: string[]
  dateType: string
  date: string
  time: string
}

const REPORT_FILTER_ID = "daily-report"
const REPORT_FILTER_KEYS: (keyof ReportFilterQueries)[] = [
  "users",
  "dateType",
  "date",
  "time",
]

const DEFAULT_TIME = "00:00-23:59"

const parseTimeRange = (value: unknown) => {
  const [start, end] = String(value || DEFAULT_TIME).split("-")
  const valid = (time?: string) =>
    !!time && /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  return {
    start: valid(start) ? start : "00:00",
    end: valid(end) ? end : "23:59",
  }
}

const LABELS = {
  users: "Ажилчид",
  dateType: "Огнооны төрөл",
  date: "Хугацаа",
  time: "Цаг",
}

const DATE_TYPE_OPTIONS: FilterOption[] = [
  { value: "paid", label: "Төлсөн" },
  { value: "created", label: "Үүсгэсэн" },
  { value: "modified", label: "Сүүлд өөрчилсөн" },
  { value: "due", label: "Гүйцэтгэх" },
  { value: "close", label: "Хаагдсан" },
  { value: "return", label: "Буцаасан" },
]

const useUserOptions = (): FilterOption[] => {
  const { data } = useQuery<{ posUsers: Customer[] }>(queries.users)
  return (data?.posUsers || []).map((user) => ({
    value: user._id,
    label: user.email || user._id,
  }))
}

const toArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : value ? [String(value)] : []

const UserOptionList = ({
  options,
  selected,
  onToggle,
}: {
  options: FilterOption[]
  selected: string[]
  onToggle: (value: string) => void
}) => (
  <Command>
    <div className="border-b bg-background">
      <CommandPrimitive.Input
        autoFocus
        placeholder={`${LABELS.users} хайх`}
        className={filterInputClass}
      />
    </div>
    <CommandList className="m-1 max-h-72">
      <CommandEmpty className="py-8 text-center text-[13px] text-muted-foreground">
        Олдсонгүй
      </CommandEmpty>
      {options.map((option) => {
        const checked = selected.includes(option.value)
        return (
          <CommandItem
            key={option.value}
            value={`${option.label} ${option.value}`}
            className={cn(
              filterItemClass,
              checked && "text-primary aria-selected:text-primary"
            )}
            onSelect={() => onToggle(option.value)}
          >
            <span className="truncate">{option.label}</span>
            {checked && <CheckIcon className="ml-auto text-primary" />}
          </CommandItem>
        )
      })}
    </CommandList>
  </Command>
)

const useUsersQuery = () => {
  const { sessionKey } = useFilterContext()
  const [query, setQuery] = useFilterQueryState<string[]>("users", sessionKey)
  const selected = toArray(query)

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    setQuery(next.length ? next : null)
  }

  return { selected, toggle }
}

const ReportUsersFilterView = ({ options }: { options: FilterOption[] }) => {
  const { resetFilterState } = useFilterContext()
  const { selected, toggle } = useUsersQuery()

  return (
    <Filter.View filterKey="users">
      <UserOptionList
        options={options}
        selected={selected}
        onToggle={(value) => {
          toggle(value)
          resetFilterState()
        }}
      />
    </Filter.View>
  )
}

const ReportUsersFilterBar = ({ options }: { options: FilterOption[] }) => {
  const [open, setOpen] = useState(false)
  const { selected, toggle } = useUsersQuery()
  const labels = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label)

  if (!selected.length) return null

  return (
    <Filter.BarItem queryKey="users">
      <Filter.BarName>
        <UsersIcon />
        {LABELS.users}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Filter.BarButton filterKey="users">
            <span className="truncate">
              {labels.length > 1
                ? `${labels.length} ажилтан`
                : labels[0] || selected[0]}
            </span>
          </Filter.BarButton>
        </PopoverTrigger>
        <Filter.Content>
          <UserOptionList
            options={options}
            selected={selected}
            onToggle={(value) => {
              toggle(value)
              setOpen(false)
            }}
          />
        </Filter.Content>
      </Popover>
    </Filter.BarItem>
  )
}

const ReportDateTypeFilterBar = () => (
  <Filter.BarItem queryKey="dateType">
    <Filter.BarName>
      <CalendarCogIcon />
      {LABELS.dateType}
    </Filter.BarName>
    <FilterSelectBar
      queryKey="dateType"
      options={DATE_TYPE_OPTIONS}
      placeholder={`${LABELS.dateType} хайх`}
    />
  </Filter.BarItem>
)

const ReportDateFilterBar = () => (
  <Filter.BarItem queryKey="date">
    <Filter.BarName>
      <CalendarIcon />
      {LABELS.date}
    </Filter.BarName>
    <Filter.Date filterKey="date" label={LABELS.date} />
  </Filter.BarItem>
)

const ReportFilterPopover = ({ users }: { users: FilterOption[] }) => {
  const [filters] = useMultiQueryState<ReportFilterQueries>(REPORT_FILTER_KEYS)

  return (
    <>
      <Filter.Popover>
        <Filter.Trigger
          isFiltered={Object.values(filters).some((value) => value !== null)}
        />
        <Filter.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder="Шүүлтүүр" />
              <CommandList className="m-1 max-h-none">
                <Filter.Item
                  value="users"
                  label={LABELS.users}
                  active={filters.users !== null}
                >
                  <UsersIcon />
                  {LABELS.users}
                </Filter.Item>
                <Filter.Item
                  value="dateType"
                  label={LABELS.dateType}
                  active={filters.dateType !== null}
                >
                  <CalendarCogIcon />
                  {LABELS.dateType}
                </Filter.Item>
                <CommandSeparator className="my-1" />
                <Filter.Item
                  value="date"
                  label={LABELS.date}
                  active={filters.date !== null}
                >
                  <CalendarIcon />
                  {LABELS.date}
                </Filter.Item>
                <Filter.Item
                  value="time"
                  label={LABELS.time}
                  active={filters.time !== null}
                  inDialog
                >
                  <ClockIcon />
                  {LABELS.time}
                </Filter.Item>
              </CommandList>
            </Command>
          </Filter.View>
          <ReportUsersFilterView options={users} />
          <FilterSelectView
            queryKey="dateType"
            options={DATE_TYPE_OPTIONS}
            placeholder={`${LABELS.dateType} хайх`}
          />
          <Filter.View filterKey="date">
            <Filter.DateView filterKey="date" label={LABELS.date} />
          </Filter.View>
        </Filter.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="date" inDialog>
          <Filter.DialogDateView filterKey="date" label={LABELS.date} />
        </Filter.View>
        <Filter.View filterKey="time" inDialog>
          <ReportTimeFilterDialogView />
        </Filter.View>
      </Filter.Dialog>
    </>
  )
}

const timeInputClass =
  "inline-flex h-7 w-full items-center rounded-sm bg-background px-3 text-[13px] font-medium tabular-nums shadow-xs outline-hidden data-[focus-within=true]:shadow-focus"

const TimeInput = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) => (
  <TimeField
    aria-label={label}
    hourCycle={24}
    value={parseTime(value)}
    onChange={(next) => next && onChange(next.toString().slice(0, 5))}
  >
    <DateInput unstyled className={timeInputClass} />
  </TimeField>
)

const ReportTimeFilterDialogView = () => {
  const { sessionKey, setDialogView, setOpenDialog, resetFilterState } =
    useFilterContext()
  const [query, setQuery] = useFilterQueryState<string>("time", sessionKey)
  const initial = parseTimeRange(query)
  const [start, setStart] = useState(initial.start)
  const [end, setEnd] = useState(initial.end)

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = `${start}-${end}`
    setQuery(value === DEFAULT_TIME ? null : value)
    setDialogView("root")
    setOpenDialog(false)
  }

  return (
    <DialogContent
      hideClose
      overlayClassName={filterDialogOverlayClass}
      className={filterDialogClass}
    >
      <form onSubmit={onSubmit}>
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {LABELS.time}аар шүүх
          </DialogTitle>
        </DialogHeader>
        <div className="my-4 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Эхлэх
            </span>
            <TimeInput label="Эхлэх цаг" value={start} onChange={setStart} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Дуусах
            </span>
            <TimeInput label="Дуусах цаг" value={end} onChange={setEnd} />
          </div>
        </div>
        <DialogFooter className="sm:space-x-3">
          <Button
            type="button"
            variant="outline"
            className={filterDialogButtonClass}
            onClick={resetFilterState}
          >
            Болих
          </Button>
          <Button type="submit" className={filterDialogButtonClass}>
            Хэрэглэх
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const ReportTimeFilterBar = () => {
  const { sessionKey } = useFilterContext()
  const [query] = useFilterQueryState<string>("time", sessionKey)
  const { start, end } = parseTimeRange(query)

  return (
    <Filter.BarItem queryKey="time">
      <Filter.BarName>
        <ClockIcon />
        {LABELS.time}
      </Filter.BarName>
      <Filter.BarButton filterKey="time" inDialog>
        <span className="tabular-nums">
          {start} – {end}
        </span>
      </Filter.BarButton>
    </Filter.BarItem>
  )
}

const ReportForm = ({ getReport, loading }: ReportFormProps) => {
  const setReportStartDate = useSetAtom(reportStartDateAtom)
  const setReportEndDate = useSetAtom(reportEndDateAtom)
  const currentUser = useAtomValue(currentUserAtom)
  const users = useUserOptions()
  const [filters] = useMultiQueryState<ReportFilterQueries>(REPORT_FILTER_KEYS)
  const usersKey = JSON.stringify(
    filters.users
      ? toArray(filters.users)
      : currentUser?._id
        ? [currentUser._id]
        : []
  )
  const dateType = filters.dateType ? String(filters.dateType) : "paid"
  const dateKey = filters.date ? String(filters.date) : "today"
  const timeKey = filters.time ? String(filters.time) : DEFAULT_TIME

  const request = useMemo(() => {
    const { start, end } = parseTimeRange(timeKey)
    const range = parseDateRangeFromString(dateKey)
    const startDate = combineDateTime(
      startOfDay(range?.from ?? new Date()),
      start
    )
    const endDate = combineDateTime(
      endOfDay(range?.to ?? range?.from ?? new Date()),
      end
    )

    if (!startDate || !endDate) return { error: "Огноо, цаг буруу байна" }
    if (startDate > endDate)
      return { error: "Дуусах хугацаа эхлэхээс хойш байх ёстой" }

    return {
      variables: {
        posUserIds: JSON.parse(usersKey) as string[],
        dateType,
        startDate,
        endDate,
      },
    }
  }, [usersKey, dateType, dateKey, timeKey])

  const runReport = useCallback(async () => {
    if (!request.variables) return onError(request.error)

    try {
      const result = await getReport({ variables: request.variables })

      if (result.error) throw result.error
      if (!result.data) throw new Error("Тайлангийн мэдээлэл ирсэнгүй")

      setReportStartDate(request.variables.startDate)
      setReportEndDate(request.variables.endDate)
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Тайлан гаргахад алдаа гарлаа. Дахин оролдоно уу."
      )
    }
  }, [getReport, request, setReportEndDate, setReportStartDate])

  useEffect(() => {
    void runReport()
  }, [runReport])

  return (
    <div className="flex min-h-10 flex-none items-center gap-3 border-b px-3 py-1.5 print:hidden">
      <Filter id={REPORT_FILTER_ID}>
        <Filter.Bar>
          <ReportFilterPopover users={users} />
          <ReportUsersFilterBar options={users} />
          <ReportDateTypeFilterBar />
          <ReportDateFilterBar />
          <ReportTimeFilterBar />
        </Filter.Bar>
      </Filter>
      <Button
        type="button"
        variant="outline"
        className="h-7 flex-none gap-1.5 rounded-md px-2.5 text-xs font-medium"
        disabled={loading}
        onClick={() => void runReport()}
      >
        <RefreshCwIcon
          className={cn("size-3.5", loading && "animate-spin")}
          aria-hidden="true"
        />
        Шинэчлэх
      </Button>
    </div>
  )
}

export default ReportForm
