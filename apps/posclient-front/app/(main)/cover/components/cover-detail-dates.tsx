"use client"

import {
  beginDateAtom,
  endDateAtom,
  coverStatusAtom,
  terminalFetchBusyAtom,
} from "@/store/cover.store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useAtom, useAtomValue } from "jotai"
import { useForm } from "react-hook-form"
import * as z from "zod"

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

import { useCoverAmounts } from "../hooks/useCoverAmounts"
import { createCoverDatesSchema, getCoverEndDate } from "../utils/coverDates"

const FormSchema = createCoverDatesSchema()

export const Dates = () => {
  const beginDate = useAtomValue(beginDateAtom)
  const status = useAtomValue(coverStatusAtom)
  const busy = useAtomValue(terminalFetchBusyAtom)
  const [endDate, setEndDate] = useAtom(endDateAtom)

  const { getCoverAmounts, loading } = useCoverAmounts()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    values: {
      endDate: endDate ? new Date(endDate) : new Date(),
      time: format(endDate ? new Date(endDate) : new Date(), "HH:mm"),
    },
  })

  const onSubmit = ({ time, endDate }: z.infer<typeof FormSchema>) => {
    const end = getCoverEndDate(endDate, time)
    setEndDate(end)
    getCoverAmounts({
      variables: {
        endDate: end,
      },
    })
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset
          disabled={busy || status === "confirm" || status === "confirming"}
          className="flex items-start gap-2 flex-wrap"
        >
          {!!beginDate && (
            <FormItem className="w-full">
              <FormLabel className="block">Эхлэх огноо</FormLabel>
              <FormControl>
                <Input
                  disabled
                  className="w-[250px]"
                  value={format(new Date(beginDate), "yyyy.MM.dd HH:mm")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">Дуусах огноо</FormLabel>
                <FormControl>
                  <DatePicker
                    toDate={new Date()}
                    date={field.value}
                    setDate={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">Дуусах цаг</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="time"
                    className="w-[200px]"
                    min={"00:00"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="mt-4"
            type="submit"
            loading={loading}
            variant="secondary"
          >
            Хаалтын дүн татах
          </Button>
        </fieldset>
      </form>
    </Form>
  )
}
