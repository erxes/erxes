import { useState } from "react"
import { useRouter } from "next/navigation"
import { filterItemClass } from "@/modules/filter"
import OrderCancel from "@/modules/orders/components/orderCancel"
import { RecordTable } from "@/modules/record-table"
import { modeAtom } from "@/store"
import { detailIdAtom, openReturnDialogAtom } from "@/store/history.store"
import { activeOrderIdAtom } from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"
import {
  ChevronsRight,
  PanelRightOpenIcon,
  PrinterIcon,
  ShoppingCartIcon,
} from "lucide-react"

import { IOrderHistory } from "@/types/order.types"
import useReciept from "@/lib/useReciept"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import PaymentDetail from "./paymentDetail"

const HistoryItemAction = ({ _id, paidDate, number }: IOrderHistory) => {
  const router = useRouter()
  const setActiveOrder = useSetAtom(activeOrderIdAtom)
  const setOpenDetail = useSetAtom(detailIdAtom)
  const setReturnId = useSetAtom(openReturnDialogAtom)
  const [open, setOpen] = useState(false)
  const [showEbarimt, setShowEbarimt] = useState(false)
  const { iframeRef } = useReciept({
    onCompleted() {
      setShowEbarimt(false)
    },
  })
  const mode = useAtomValue(modeAtom)

  const run = (action: () => void) => () => {
    setOpen(false)
    action()
  }

  return (
    <>
      {showEbarimt && (
        <iframe
          title="Баримт хэвлэх"
          src={`/reciept/ebarimt?id=${_id}`}
          className="absolute h-1 w-1"
          style={{ top: 10000, left: 10000 }}
          ref={iframeRef}
        />
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {mode === "mobile" ? (
            <Button variant="ghost" size="icon" aria-label="Үйлдлүүд">
              <ChevronsRight
                className="h-6 w-6 text-neutral-500"
                strokeWidth={1.5}
              />
            </Button>
          ) : (
            <RecordTable.MoreButton className="h-full w-full" />
          )}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-56 overflow-hidden rounded-md bg-background p-0"
        >
          <Command>
            <CommandList className="m-1 max-h-none">
              <CommandItem
                value="detail"
                className={filterItemClass}
                onSelect={run(() => {
                  setReturnId(null)
                  setOpenDetail(_id)
                })}
              >
                <PanelRightOpenIcon />
                Дэлгэрэнгүй
              </CommandItem>
              <CommandItem
                value="active-order"
                className={filterItemClass}
                disabled={!!paidDate}
                onSelect={run(() => {
                  router.push("/")
                  setActiveOrder(_id)
                })}
              >
                <ShoppingCartIcon />
                Идэвхтэй захиалга
              </CommandItem>
              <CommandItem
                value="print-receipt"
                className={filterItemClass}
                disabled={!paidDate}
                onSelect={run(() => setShowEbarimt(true))}
              >
                <PrinterIcon />
                Баримт хэвлэх
              </CommandItem>
              <CommandSeparator className="my-1" />
              <PaymentDetail
                _id={_id}
                paidDate={paidDate}
                onSelect={() => setOpen(false)}
              />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <OrderCancel _id={_id} number={number} />
    </>
  )
}

export default HistoryItemAction
