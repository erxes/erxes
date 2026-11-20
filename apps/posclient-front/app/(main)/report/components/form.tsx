"use client"

import { useState } from "react"
import { reportEndDateAtom, reportStartDateAtom } from "@/store"
import { currentUserAtom } from "@/store/config.store"
import { LazyQueryExecFunction, useQuery } from "@apollo/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { parseTime } from "@internationalized/date"
import { startOfMonth, startOfWeek, subDays } from "date-fns"
import { useAtomValue, useSetAtom } from "jotai"
import { SearchIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import type { Customer } from "@/types/customer.types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateInput, TimeField } from "@/components/ui/time-field"

import { queries } from "../graphql"
import { combineDateTime } from "../utils/date"
import { DailyReport } from "./summary"
import { UserSelect } from "./userSelect"

interface DailyReportResponse {
  dailyReport: {
    report: DailyReport
  }
}

const FormSchema = z
  .object({
    posUserIds: z.array(z.string()).optional(),
    dateType: z.string().optional(),
    startDate: z.date({
      required_error: "Тайлан шүүх өдрөө сонгоно уу",
    }),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
    endDate: z.date({
      required_error: "Тайлан шүүх өдрөө сонгоно уу",
    }),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  })
  .superRefine((data, ctx) => {
    if (!data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Тайлан шүүх өдрөө сонгоно уу",
      })
      return
    }
    if (!data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Тайлан шүүх өдрөө сонгоно уу",
      })
      return
    }
    const start = combineDateTime(data.startDate, data.startTime)
    const end = combineDateTime(data.endDate, data.endTime)
    if (start && end && start > end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Дуусах хугацаа эхлэхээс хойш байх ёстой",
      })
    }
  })

const PRESETS = [
  { label: "Өнөөдөр", range: () => [new Date(), new Date()] },
  {
    label: "Өчигдөр",
    range: () => [subDays(new Date(), 1), subDays(new Date(), 1)],
  },
  {
    label: "7 хоног",
    range: () => [startOfWeek(new Date(), { weekStartsOn: 1 }), new Date()],
  },
  {
    label: "Энэ сар",
    range: () => [startOfMonth(new Date()), new Date()],
  },
]

const RANGE_ROWS = [
  { label: "Эхлэх", dateName: "startDate", timeName: "startTime" },
  { label: "Дуусах", dateName: "endDate", timeName: "endTime" },
] as const

const groupLabelClass =
  "px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"

type FormValues = z.infer<typeof FormSchema>

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

const LOADING_TEXT = "Уншиж байна..."

const ReportForm = ({ getReport, loading }: ReportFormProps) => {
  const setReportStartDate = useSetAtom(reportStartDateAtom)
  const setReportEndDate = useSetAtom(reportEndDateAtom)
  const currentUser = useAtomValue(currentUserAtom)
  const [preset, setPreset] = useState<string | null>("Өнөөдөр")

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      posUserIds: (currentUser?._id && [currentUser?._id]) || [],
      dateType: "paid",
      startDate: new Date(),
      startTime: "00:00",
      endDate: new Date(),
      endTime: "23:59",
    },
  })

  const { errors } = form.formState
  const rangeError =
    errors.startDate?.message ||
    errors.startTime?.message ||
    errors.endDate?.message ||
    errors.endTime?.message

  const onSubmit = async (data: FormValues) => {
    try {
      if (!data.startDate) {
        form.setError("startDate", {
          type: "manual",
          message: "Тайлан шүүх өдрөө сонгоно уу",
        })
        return
      }

      if (!data.endDate) {
        form.setError("endDate", {
          type: "manual",
          message: "Тайлан шүүх өдрөө сонгоно уу",
        })
        return
      }

      const combinedBDate = combineDateTime(data.startDate, data.startTime)
      if (!combinedBDate) {
        form.setError("startTime", {
          type: "manual",
          message: "Invalid date-time combination",
        })
        return
      }
      const combinedEDate = combineDateTime(data.endDate, data.endTime)
      if (!combinedEDate) {
        form.setError("endTime", {
          type: "manual",
          message: "Invalid date-time combination",
        })
        return
      }

      const result = await getReport({
        variables: {
          posUserIds: data.posUserIds || [],
          dateType: data.dateType,
          startDate: combinedBDate,
          endDate: combinedEDate,
        },
      })

      if (result.data) {
        if (!Number.isNaN(combinedBDate.getTime())) {
          setReportStartDate(combinedBDate)
        }
        if (!Number.isNaN(combinedEDate.getTime())) {
          setReportEndDate(combinedEDate)
        }
      } else {
        console.error("No data returned from the report query")
      }
    } catch (error) {
      console.error("Error generating report:", error)
      form.setError("root", {
        type: "manual",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while generating the report",
      })
    }
  }

  const {
    data: userData,
    loading: loadingUsers,
    error: usersError,
  } = useQuery<{ posUsers: Customer[] }>(queries.users)

  if (usersError) {
    console.error("Error loading users:", usersError)
    return (
      <div>
        Ажилчдын мэдээллийг ачааллахад алдаа гарлаа. Дараа дахин оролдоно уу.
      </div>
    )
  }

  const posUsers = userData?.posUsers || []
  const posUserOptions = posUsers.map((user) => ({
    label: user.email || "Unknown",
    value: user._id,
  }))

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-5 p-3 print:hidden"
      >
        <FormField
          control={form.control}
          name="posUserIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={groupLabelClass}>Ажилчид</FormLabel>
              <FormControl>
                {loadingUsers ? (
                  <Input disabled placeholder={LOADING_TEXT} className="h-8" />
                ) : (
                  <UserSelect
                    options={posUserOptions}
                    values={field.value}
                    onChange={field.onChange}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={groupLabelClass}>Огнооны төрөл</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-8 text-[13px]">
                    <SelectValue placeholder="Ангилал сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Төлсөн | Paid</SelectItem>
                    <SelectItem value="created">Үүсгэсэн | Created</SelectItem>
                    <SelectItem value="modified">
                      Сүүлд өөрчилсөн | Modified
                    </SelectItem>
                    <SelectItem value="due">Гүйцэтгэх | Due</SelectItem>
                    <SelectItem value="close">Хаагдсан | Close</SelectItem>
                    <SelectItem value="return">Буцаасан | Return</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2">
          <div className={groupLabelClass}>Хугацаа</div>
          <div className="grid grid-cols-4 gap-0.5 rounded-lg border bg-background p-0.5">
            {PRESETS.map(({ label, range }) => (
              <button
                key={label}
                type="button"
                className={cn(
                  "h-7 truncate rounded-md px-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  preset === label &&
                    "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                )}
                onClick={() => {
                  setPreset(label)
                  const [start, end] = range()
                  form.setValue("startDate", start)
                  form.setValue("startTime", "00:00")
                  form.setValue("endDate", end)
                  form.setValue("endTime", "23:59", { shouldValidate: true })
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="divide-y overflow-hidden rounded-lg border bg-background">
            {RANGE_ROWS.map(({ label, dateName, timeName }) => (
              <div key={dateName} className="flex h-9 items-center">
                <span className="w-16 flex-none pl-3 text-xs text-muted-foreground">
                  {label}
                </span>
                <FormField
                  control={form.control}
                  name={dateName}
                  render={({ field }) => (
                    <DatePicker
                      date={field.value}
                      setDate={(date) => {
                        setPreset(null)
                        field.onChange(date)
                      }}
                      toDate={new Date()}
                      className="h-9 min-w-0 flex-1 justify-start rounded-none border-0 bg-transparent px-2 text-[13px] font-medium tabular-nums shadow-none hover:bg-accent [&_svg]:text-muted-foreground"
                    />
                  )}
                />
                <span className="h-5 w-px flex-none bg-border" />
                <FormField
                  control={form.control}
                  name={timeName}
                  render={({ field }) => (
                    <TimeField
                      aria-label={`${label} цаг`}
                      hourCycle={24}
                      value={field.value ? parseTime(field.value) : null}
                      onChange={(next) => {
                        setPreset(null)
                        field.onChange(next ? next.toString().slice(0, 5) : "")
                      }}
                    >
                      <DateInput
                        unstyled
                        className="inline-flex h-9 items-center px-3 text-[13px] font-medium tabular-nums outline-hidden data-[focus-within=true]:bg-accent"
                      />
                    </TimeField>
                  )}
                />
              </div>
            ))}
          </div>
          {!!rangeError && (
            <p className="px-1 text-xs font-medium text-destructive">
              {rangeError}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="h-8 w-full"
          disabled={loading}
          loading={loading}
          aria-label="Тайлан шүүх"
        >
          {!loading && (
            <SearchIcon className="h-4 w-4 mr-1" aria-hidden="true" />
          )}
          Тайлан шүүх
        </Button>
      </form>
    </Form>
  )
}

export default ReportForm
