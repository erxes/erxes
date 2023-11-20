import React from "react"
import EmptyTable from "@/modules/timeclock/component/EmptyTable"

import Loader from "@/components/ui/loader"
import Pagination from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useFeedback } from "../../../hooks/useFeedback"
import FeedbackAction from "../action/FeedbackAction"
import FeedbackRow from "./FeedbackRow"
import FeedbackTableFooter from "./FeedbackTableFooter"

type Props = {
  setToggleView: (view: boolean) => void
}

const FeedbackList = ({ setToggleView }: Props) => {
  const { stages, tickets, loading } = useFeedback({
    pipelineId: "KKDqVWAU53tjUb9ecefLs",
  })

  console.log("tickets", tickets)
  console.log("stages", stages)

  const list = ["Name", "Reason", "Total Hours", "Date", "Status"]
  const queryParams = { page: 1, perPage: 10 }

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

    if (tickets.length === 0) {
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
    <div className="h-[calc(100vh-66px)] p-9 pt-5 flex flex-col justify-between">
      <div className="flex flex-col gap-2 h-full">
        <FeedbackAction setToggleView={setToggleView} />
        {renderTable()}
        <div className="flex items-center justify-between mt-auto">
          <FeedbackTableFooter
            queryParams={queryParams}
            totalCount={tickets.length}
          />
          <Pagination count={tickets.length} />
        </div>
      </div>
    </div>
  )
}

export default FeedbackList
