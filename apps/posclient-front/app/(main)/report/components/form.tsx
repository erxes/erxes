"use client"

import { useState } from "react"
import { PanelField, PanelSection } from "@/modules/record-side-panel"
import { reportEndDateAtom, reportStartDateAtom } from "@/store"
import { currentUserAtom } from "@/store/config.store"
import { LazyQueryExecFunction, useQuery } from "@apollo/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { parseTime } from "@internationalized/date"
import { format, startOfMonth, startOfWeek, subDays } from "date-fns"
import { useAtomValue, useSetAtom } from "jotai"
import {
  CalendarCheckIcon,
  CalendarCogIcon,
  CalendarIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"
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
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { DateInput, TimeField } from "@/components/ui/time-field"
import { onError, toast } from "@/components/ui/use-toast"

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
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Цагаа ЦЦ:ММ хэлбэрээр оруулна уу"),
    endDate: z.date({
      required_error: "Тайлан шүүх өдрөө сонгоно уу",
    }),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Цагаа ЦЦ:ММ хэлбэрээр оруулна уу"),
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
  {
    label: "Эхлэх",
    icon: CalendarIcon,
    dateName: "startDate",
    timeName: "startTime",
  },
  {
    label: "Дуусах",
    icon: CalendarCheckIcon,
    dateName: "endDate",
    timeName: "endTime",
  },
] as const

const cellControlClass =
  "[&>button]:h-7 [&>button]:rounded-sm [&>button]:border-0 [&>button]:bg-transparent [&>button]:px-2 [&>button]:text-xs [&>button]:shadow-none [&>button:hover]:bg-accent"

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
    const combinedBDate = combineDateTime(data.startDate, data.startTime)
    if (!combinedBDate) {
      form.setError("startTime", {
        type: "manual",
        message: "Эхлэх огноо, цаг буруу байна",
      })
      return
    }
    const combinedEDate = combineDateTime(data.endDate, data.endTime)
    if (!combinedEDate) {
      form.setError("endTime", {
        type: "manual",
        message: "Дуусах огноо, цаг буруу байна",
      })
      return
    }

    try {
      const result = await getReport({
        variables: {
          posUserIds: data.posUserIds || [],
          dateType: data.dateType,
          startDate: combinedBDate,
          endDate: combinedEDate,
        },
      })

      if (result.error) throw result.error
      if (!result.data) throw new Error("Тайлангийн мэдээлэл ирсэнгүй")

      setReportStartDate(combinedBDate)
      setReportEndDate(combinedEDate)
      toast({
        title: "Тайлан бэлэн боллоо",
        description: `${format(combinedBDate, "yyyy.MM.dd HH:mm")} – ${format(
          combinedEDate,
          "yyyy.MM.dd HH:mm"
        )}`,
        variant: "success",
      })
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Тайлан гаргахад алдаа гарлаа. Дахин оролдоно уу."
      )
    }
  }

  const {
    data: userData,
    loading: loadingUsers,
    error: usersError,
  } = useQuery<{ posUsers: Customer[] }>(queries.users)

  if (usersError) {
    return (
      <p role="alert" className="p-3 text-xs text-destructive">
        Ажилчдын мэдээллийг ачааллахад алдаа гарлаа. Дараа дахин оролдоно уу.
      </p>
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
        className="flex min-h-full w-full flex-col print:hidden"
      >
        <div className="flex-1 border-b px-3 pb-2">
          <PanelSection title="Шүүлт" nested>
            <FormField
              control={form.control}
              name="posUserIds"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormLabel className="sr-only">Ажилчид</FormLabel>
                  <PanelField icon={UsersIcon} label="Ажилчид" bare>
                    <FormControl>
                      {loadingUsers ? (
                        <Skeleton className="h-7 w-full" />
                      ) : (
                        <div className={cellControlClass}>
                          <UserSelect
                            options={posUserOptions}
                            values={field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      )}
                    </FormControl>
                  </PanelField>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateType"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormLabel className="sr-only">Огнооны төрөл</FormLabel>
                  <PanelField icon={CalendarCogIcon} label="Огнооны төрөл" bare>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-7 rounded-sm border-0 bg-transparent px-2 text-xs shadow-none hover:bg-accent">
                          <SelectValue placeholder="Сонгох" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Төлсөн</SelectItem>
                        <SelectItem value="created">Үүсгэсэн</SelectItem>
                        <SelectItem value="modified">
                          Сүүлд өөрчилсөн
                        </SelectItem>
                        <SelectItem value="due">Гүйцэтгэх</SelectItem>
                        <SelectItem value="close">Хаагдсан</SelectItem>
                        <SelectItem value="return">Буцаасан</SelectItem>
                      </SelectContent>
                    </Select>
                  </PanelField>
                </FormItem>
              )}
            />
          </PanelSection>

          <PanelSection title="Хугацаа" nested>
            <div className="grid grid-cols-4 gap-0.5 rounded-lg bg-foreground/5 p-0.5">
              {PRESETS.map(({ label, range }) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={preset === label}
                  className={cn(
                    "h-7 truncate rounded-md px-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:shadow-focus focus-visible:outline-hidden",
                    preset === label &&
                      "bg-background text-primary shadow-sm hover:text-primary"
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
            {RANGE_ROWS.map(({ label, icon, dateName, timeName }) => (
              <PanelField key={dateName} icon={icon} label={label} bare>
                <div className="flex min-w-0 items-center">
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
                        className="h-7 min-w-0 flex-1 justify-start rounded-sm border-0 bg-transparent px-2 text-xs font-normal tabular-nums shadow-none hover:bg-accent [&_svg]:hidden"
                      />
                    )}
                  />
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
                          field.onChange(
                            next ? next.toString().slice(0, 5) : ""
                          )
                        }}
                      >
                        <DateInput
                          unstyled
                          className="inline-flex h-7 items-center rounded-sm px-2 text-xs tabular-nums outline-hidden hover:bg-accent data-[focus-within=true]:bg-accent"
                        />
                      </TimeField>
                    )}
                  />
                </div>
              </PanelField>
            ))}
            {!!rangeError && (
              <p
                role="alert"
                className="px-1 text-xs font-medium text-destructive"
              >
                {rangeError}
              </p>
            )}
          </PanelSection>
        </div>
        <div className="sticky bottom-0 flex-none border-t bg-sidebar p-2">
          <Button
            type="submit"
            className="h-8 w-full gap-1.5 rounded text-[13px] font-medium"
            disabled={loading}
            loading={loading}
          >
            {!loading && <SearchIcon className="size-4" aria-hidden="true" />}
            Тайлан шүүх
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ReportForm
