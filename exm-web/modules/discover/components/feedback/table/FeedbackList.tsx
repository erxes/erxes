import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { exmAtom } from "@/modules/JotaiProiveder"
import { useFeedback } from "@/modules/discover/hooks/useFeedback"
import EmptyTable from "@/modules/timeclock/component/EmptyTable"
import { useAtomValue } from "jotai"

import { Button } from "@/components/ui/button"
import Loader from "@/components/ui/loader"
import Pagination from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import FeedbackRow from "./FeedbackRow"
import FeedbackTableFooter from "./FeedbackTableFooter"

type Props = {
  queryParams: any
  setToggleView: (view: boolean) => void
}

const FeedbackList = ({ queryParams, setToggleView }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentParams = Object.fromEntries(searchParams)
  const params = new URLSearchParams(currentParams)

  const exm = useAtomValue(exmAtom)

  const { tickets, totalCount, loading } = useFeedback({
    ...queryParams,
    pipelineId: exm?.ticketPipelineId!,
  })

  const color = exm ? exm.appearance.primaryColor : "#4f46e5"

  const list = ["Name", "Type", "Created", "Closed", "Status"]

  const renderTableBody = () => {
    return (
      <TableBody>
        {tickets.map((ticket: any, index: number) => (
          <FeedbackRow ticket={ticket} key={index} />
        ))}
      </TableBody>
    )
  }

  const renderTable = () => {
    if (loading) {
      return <Loader />
    }

    if (totalCount === 0) {
      return <EmptyTable />
    }

    return (
      <div className="flex overflow-y-auto ">
        <Table>
          <TableHeader className="sticky top-0 bg-[#f8f9fa] border-none">
            <TableRow className="border-none">
              {list.map((item, index) => (
                <TableHead
                  key={index}
                  className="py-5 border-none text-[#4F33AF] font-bold"
                >
                  {item}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {renderTableBody()}
        </Table>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-between h-full gap-2">
      <div className="flex justify-end mb-2">
        <Button
          onClick={() => {
            setToggleView(true)

            params.set("view", "form")

            router.push(`?${params.toString()}`, {
              scroll: false,
            })
          }}
          style={{
            backgroundColor: color,
          }}
        >
          Send Feedback
        </Button>
      </div>
      {renderTable()}
      <div className="flex items-center justify-between mt-auto">
        <FeedbackTableFooter
          queryParams={queryParams}
          totalCount={totalCount}
        />
        <Pagination count={totalCount} />
      </div>
    </div>
  )
}

export default FeedbackList
