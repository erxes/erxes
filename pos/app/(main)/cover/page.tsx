"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@apollo/client"
import { subDays } from "date-fns"
import { AlarmPlus } from "lucide-react"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

import DataTable from "./components/table"
import { queries } from "./graphql"

const Cover = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 15),
    to: new Date(),
  })
  const { data, loading: loadingCovers } = useQuery(queries.covers, {
    variables: {
      startDate: dateRange?.from,
      endDate: dateRange?.to,
    },
  })

  return (
    <div className="flex flex-auto flex-col px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <DatePickerWithRange
            toDate={new Date()}
            date={dateRange}
            setDate={setDateRange}
          />
        </div>
        <Button Component={Link} href="/cover/detail?id=create">
          <AlarmPlus className="mr-2 h-4 w-4" />
          Нэмэх
        </Button>
      </div>
      {!loadingCovers && <DataTable data={(data || {}).covers} />}
    </div>
  )
}

export default Cover
