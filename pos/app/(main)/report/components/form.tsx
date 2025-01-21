"use client"
import { reportDateAtom } from "@/store"
import {
  LazyQueryExecFunction,
  useQuery,
} from "@apollo/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, set, isFuture } from "date-fns"
import { useSetAtom } from "jotai"
import { SearchIcon } from 'lucide-react'
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Customer } from "@/types/customer.types"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { FacetedFilter } from "@/components/ui/faceted-filter"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { queries } from "../graphql"

const isDateTimeInTheFuture = (date: Date, hour: number, minute: number) => {
  const dateWithTime = set(date, { hours: hour, minutes: minute })
  return isFuture(dateWithTime)
}

interface UsersQueryResponse {
  posUsers: Customer[]
}

interface ReportVariables {
  posUserIds?: string[]
  posNumber: string
}

const FormSchema = z.object({
  posUserIds: z.array(z.string()).optional(),
  posNumber: z.date({
    required_error: "Тайлан шүүх өдрөө сонгоно уу",
  }),
  hour: z.number()
    .min(0, "Цаг 0-оос их байх ёстой")
    .max(23, "Цаг 23-аас бага байх ёстой"),
  minute: z.number()
    .min(0, "Минут 0-оос их байх ёстой")
    .max(59, "Минут 59-өөс бага байх ёстой"),
}).refine(
  (data) => !isDateTimeInTheFuture(data.posNumber, data.hour, data.minute),
  {
    message: "Ирээдүйн цаг оруулах боломжгүй",
    path: ["posNumber", "hour", "minute"],
  }
)

type FormValues = z.infer<typeof FormSchema>

interface ReportFormProps {
  getReport: LazyQueryExecFunction<any, ReportVariables>
  loading: boolean
}

const ReportForm = ({
  getReport,
  loading,
}: ReportFormProps) => {
  const setReportDate = useSetAtom(reportDateAtom)
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      hour: 0,
      minute: 0,
    },
  })

  const onSubmit = (data: FormValues) => {
    const dateWithTime = set(data.posNumber, {
      hours: data.hour,
      minutes: data.minute,
    })

    getReport({
      variables: {
        posUserIds: data.posUserIds,
        posNumber: format(dateWithTime, "yyyyMMddHHmm"),
      },
    })
    setReportDate(dateWithTime)
  }

  const { data: userData, loading: loadingUsers } = useQuery<UsersQueryResponse>(queries.users)
  const { posUsers = [] } = userData || {}

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3 w-full md:w-1/3 print:hidden"
      >
        <FormField
          control={form.control}
          name="posUserIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ажилчид</FormLabel>
              <FormControl>
                {loadingUsers ? (
                  <Input disabled placeholder="Уншиж байна..." />
                ) : (
                  <FacetedFilter
                    options={posUsers.map((user) => ({
                      label: user.email || "Unknown",
                      value: user._id,
                    }))}
                    title="Ажилчид"
                    values={field.value}
                    onSelect={field.onChange}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="posNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block">Oгноо</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  toDate={new Date()}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-2">
          <FormField
            control={form.control}
            name="hour"
            render={({ field: { onChange, ...field } }) => (
              <FormItem className="flex-1">
                <FormLabel>Цаг</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    max={23}
                    placeholder="00"
                    onChange={(e) => onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minute"
            render={({ field: { onChange, ...field } }) => (
              <FormItem className="flex-1">
                <FormLabel>Минут</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    max={59}
                    placeholder="00"
                    onChange={(e) => onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" size="sm" loading={loading}>
          {!loading && <SearchIcon className="h-4 w-4 mr-1" />}
          Тайлан шүүх
        </Button>
      </form>
    </Form>
  )
}

export default ReportForm