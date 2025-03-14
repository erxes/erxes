import { useState } from "react"
import { useRouter } from "next/navigation"
import { modeAtom } from "@/store"
import { detailIdAtom } from "@/store/history.store"
import { activeOrderIdAtom } from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"
import { ChevronsRight, MoreHorizontal } from "lucide-react"

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

import OrderCancel from "@/modules/orders/components/orderCancel"
import OrderReturn from "./orderReturn"
import PaymentDetail from "./paymentDetail"

const HistoryItemAction = ({
  _id,
  paidDate,
  number,
  totalAmount,
}: IOrderHistory) => {
  const router = useRouter()
  const setActiveOrder = useSetAtom(activeOrderIdAtom)
  const setOpenDetail = useSetAtom(detailIdAtom)
  const [showEbarimt, setShowEbarimt] = useState(false)
  const { iframeRef } = useReciept({
    onCompleted() {
      setShowEbarimt(false)
    },
  })
  const mode = useAtomValue(modeAtom)

  return (
    <>
      {showEbarimt && (
        <iframe
          src={`/reciept/ebarimt?id=${_id}`}
          className="absolute h-1 w-1"
          style={{ top: 10000, left: 10000 }}
          ref={iframeRef}
        />
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={mode !== "mobile" ? "h-8 w-8 p-0" : ""}
          >
            {mode === "mobile" ? (
              <ChevronsRight
                className="h-6 w-6 text-neutral-500"
                strokeWidth={1.5}
              />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
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

          <PaymentDetail _id={_id} paidDate={paidDate} />
        </DropdownMenuContent>
      </DropdownMenu>
      <OrderReturn _id={_id} number={number} totalAmount={totalAmount} />
      <OrderCancel _id={_id} number={number} />
    </>
  )
}

export default HistoryItemAction
