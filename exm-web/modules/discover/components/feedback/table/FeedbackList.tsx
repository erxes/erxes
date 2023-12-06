import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { exmAtom } from "@/modules/JotaiProiveder"
import { useFeedback } from "@/modules/discover/hooks/useFeedback"
import { useAtomValue } from "jotai"
import { PenSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import Loader from "@/components/ui/loader"
import Pagination from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import EmptyList from "../../knowledgebase/EmptyList"
import FeedbackDialog from "./FeedbackDialog"
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
  const [feedBackId, setFeedBackId] = useState("")
  const [showModal, setShowModal] = useState(false)

  const exm = useAtomValue(exmAtom)

  const { tickets, totalCount, loading } = useFeedback({
    ...queryParams,
    pipelineId: exm?.ticketPipelineId! || "",
  })

  const list = ["Name", "Type", "Created", "Closed", "Status"]

  const showDetail = (id: string) => {
    setFeedBackId(id)
    // tslint:disable-next-line:no-unused-expression
    id && setShowModal(true)
  }

  const renderTableBody = () => {
    return (
      <TableBody>
        {tickets.map((ticket: any, index: number) => (
          <FeedbackRow ticket={ticket} key={index} setFeedBackId={showDetail} />
        ))}
      </TableBody>
    )
  }

  const renderTable = () => {
    if (loading) {
      return <Loader />
    }

    if (totalCount === 0) {
      return <EmptyList />
    }

    return (
      <div className="flex overflow-y-auto ">
        <Table>
          <TableHeader className="sticky top-0 border-none">
            <TableRow className="border-none hover:bg-transparent">
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

        {feedBackId && (
          <Dialog
            open={showModal}
            onOpenChange={() => setShowModal(!showModal)}
          >
            <FeedbackDialog ticketId={feedBackId} />
          </Dialog>
        )}
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
          className="bg-success-foreground h-8 hover:bg-success-foreground rounded-lg"
        >
          <PenSquare size={15} className="mr-2" />
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
