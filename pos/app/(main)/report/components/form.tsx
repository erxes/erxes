"use client"

import { reportDateAtom } from "@/store"
import {
  LazyQueryExecFunction,
  OperationVariables,
  useQuery,
} from "@apollo/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useSetAtom } from "jotai"
import { SearchIcon } from "lucide-react"
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
})

const ReportForm = ({
  getReport,
  loading,
}: {
  getReport: LazyQueryExecFunction<any, OperationVariables>
  loading: boolean
}) => {
  const setReportDate = useSetAtom(reportDateAtom)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    getReport({
      variables: {
        posUserIds: data.posUserIds,
        posNumber: format(data.posNumber, "yyyyMMdd"),
      },
    })
    setReportDate(data.posNumber)
  }
  const { data, loading: loadingUsers } = useQuery(queries.users)

  const { posUsers } = data || {}

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3 w-1/3 print:hidden"
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
        <Button type="submit" className="w-full" size="sm" loading={loading}>
          {!loading && <SearchIcon className="h-4 w-4 mr-1" />}
          Тайлан шүүх
        </Button>
      </form>
    </Form>
  )
}

export default ReportForm
