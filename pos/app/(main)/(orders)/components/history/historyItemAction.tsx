import { useState } from "react"
import { useRouter } from "next/navigation"
import { detailIdAtom } from "@/store/history.store"
import { activeOrderAtom } from "@/store/order.store"
import { CellContext } from "@tanstack/react-table"
import { useSetAtom } from "jotai"
import { MoreHorizontal } from "lucide-react"

import { IOrderHistory } from "@/types/order.types"
import useReciept from "@/lib/useReciept"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const HistoryItemAction = ({ row }: CellContext<IOrderHistory, unknown>) => {
  const { _id, paidDate } = row.original || {}
  const router = useRouter()
  const setActiveOrder = useSetAtom(activeOrderAtom)
  const setOpenDetail = useSetAtom(detailIdAtom)
  const [showEbarimt, setShowEbarimt] = useState(false)
  const { iframeRef } = useReciept({
    onCompleted() {
      setShowEbarimt(false)
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          {showEbarimt && (
            <iframe
              src={`/reciept/ebarimt?id=${_id}`}
              className="absolute h-1 w-1"
              style={{ top: 10000, left: 10000 }}
              ref={iframeRef}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Үйлдэлүүд</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            router.push("/")
            setActiveOrder(_id)
          }}
          disabled={!!paidDate}
        >
          Идэвхтэй захиалга
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setShowEbarimt(true)}
          disabled={!paidDate}
        >
          Баримт хэвлэх
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setOpenDetail(_id)}>
          Дэлгэрэнгүй
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HistoryItemAction
