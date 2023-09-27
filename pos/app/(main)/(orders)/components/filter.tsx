"use client"

import { SetAtom } from "@/store"
import { defaultFilter } from "@/store/history.store"
import { zodResolver } from "@hookform/resolvers/zod"
import { formatISO, subDays } from "date-fns"
import { SetStateAction } from "jotai"
import { SearchIcon, XIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { IFilter } from "@/types/history.types"
import { IOrderStatus } from "@/types/order.types"
import { ORDER_STATUSES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const FormSchema = z.object({
  searchValue: z.string(),
  dateType: z.string().optional(),
  range: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
  statuses: z.array(z.string()).optional(),
  isPaid: z.boolean().optional(),
  sort: z.string().optional(),
})

const Filter = ({
  filter,
  setFilter,
  loading,
  allowedStatuses,
}: {
  filter: IFilter
  setFilter: SetAtom<[SetStateAction<IFilter>], void>
  loading?: boolean
  allowedStatuses?: string[]
}) => {
  const { searchValue, startDate, endDate, isPaid, sortField, sortDirection } =
    defaultFilter

  const defaultValues = {
    searchValue,
    range: {
      from: new Date(startDate || defaultFilter.startDate),
      to: new Date(endDate || defaultFilter.startDate),
    },
    statuses: allowedStatuses || ORDER_STATUSES.ALL,
    isPaid: typeof isPaid === "boolean" ? isPaid : undefined,
    sort:
      sortField && sortDirection
        ? sortField + (sortDirection === 1 ? "_asc" : "_desc")
        : "createdAt_asc",
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  })

  const onSubmit = ({
    searchValue,
    dateType,
    range,
    statuses,
    isPaid,
    sort,
  }: z.infer<typeof FormSchema>) => {
    const { from, to } = range || {}
    const sortField = sort?.split("_")[0]
    const sortDirection = sort?.split("_")[1] === "asc" ? 1 : -1
    setFilter({
      ...filter,
      page: 1,
      searchValue,
      statuses: (statuses || []) as IOrderStatus[],
      startDate: formatISO(new Date(from || subDays(new Date(), 10))),
      endDate: formatISO(new Date(to || new Date())),
      isPaid: typeof isPaid === "boolean" ? isPaid : undefined,
      sortField,
      sortDirection,
    })
  }

  return (
    <div className="px-4">
      <Form {...form}>
        <form
          className="grid grid-cols-4 items-end gap-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="searchValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Хайх</FormLabel>
                <FormControl>
                  <Input placeholder="Хайх..." {...field} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Oгнооны хүрээ</FormLabel>
                <FormControl>
                  <DatePickerWithRange
                    date={field.value}
                    setDate={field.onChange}
                    toDate={new Date()}
                    className=""
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="statuses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Хайх</FormLabel>
                <FormControl>
                  <FacetedFilter
                    options={(allowedStatuses || ORDER_STATUSES.ALL).map(
                      (status) => ({
                        label: status,
                        value: status,
                      })
                    )}
                    title="Төлөвүүд"
                    values={field.value}
                    onSelect={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Эрэмблэх</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="col-span-2">
                      <SelectValue placeholder="Ангилал сонгох" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt_desc">
                        Сүүлд нэмэгдсэн
                      </SelectItem>
                      <SelectItem value="createdAt_asc">
                        Эхэлж нэмэгдсэн
                      </SelectItem>
                      <SelectItem value="modifiedAt_desc">
                        Сүүлд өөрчилсөн
                      </SelectItem>
                      <SelectItem value="modifiedAt_asc">
                        Эхэлж өөрчилсөн
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPaid"
            render={({ field }) => (
              <FormItem className="flex h-10 items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Төлбөр төлсөн эсэx</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <div />
          <Button type="submit" disabled={loading}>
            <SearchIcon className="h-5 w-5 mr-1" />
            Хайх
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => {
              form.reset()
              setFilter({
                ...defaultFilter,
                statuses: allowedStatuses || ORDER_STATUSES.ALL,
              })
            }}
          >
            <XIcon className="h-5 w-5 mr-1" />
            Цэвэрлэх
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default Filter
