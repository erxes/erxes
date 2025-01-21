"use client"

import { reportDateAtom } from "@/store"
import {
  LazyQueryExecFunction,
  OperationVariables,
  useQuery,
} from "@apollo/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, set, isToday, isFuture } from "date-fns"
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

const FormSchema = z.object({
  posUserIds: z.array(z.string()).optional(),
  posNumber: z.date({
    required_error: "Тайлан шүүх өдрөө сонгоно уу",
  }),
  hour: z.string().regex(/^([0-1]?[0-9]|2[0-3])$/, "Цаг 0-23 хооронд байна"),
  minute: z.string().regex(/^[0-5]?[0-9]$/, "Минут 0-59 хооронд байна"),
})

interface ReportFormProps {
  getReport: LazyQueryExecFunction<any, OperationVariables>
  loading: boolean
}

const ReportForm = ({
  getReport,
  loading,
}: ReportFormProps) => {
  const setReportDate = useSetAtom(reportDateAtom)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      hour: "00",
      minute: "00",
    },
  })

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const dateWithTime = set(data.posNumber, {
      hours: parseInt(data.hour),
      minutes: parseInt(data.minute),
    })

    if (isToday(data.posNumber)) {
      if (isFuture(dateWithTime)) {
        form.setError('hour', {
          type: 'manual',
          message: 'Ирээдүйн цаг оруулах боломжгүй',
        })
        return
      }
    }

    getReport({
      variables: {
        posUserIds: data.posUserIds,
        posNumber: format(dateWithTime, "yyyyMMddHHmm"),
      },
    })
    setReportDate(dateWithTime)
  }

  const { data: userData, loading: loadingUsers } = useQuery(queries.users)
  const { posUsers } = userData || {}

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
                    options={(posUsers || []).map((user: Customer) => ({
                      label: user.email,
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
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Цаг</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    max="23"
                    placeholder="00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minute"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Минут</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    max="59"
                    placeholder="00"
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