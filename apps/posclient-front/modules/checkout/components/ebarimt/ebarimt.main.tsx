import { useEffect } from "react"
import usePrintBill from "@/modules/checkout/hooks/usePrintBill"
import { checkoutDialogOpenAtom, ebarimtMainDialogOpenAtom } from "@/store"
import {
  activeOrderIdAtom,
  orderTotalAmountAtom,
  setInitialAtom,
  unPaidAmountAtom,
} from "@/store/order.store"
import { ebarimtSheetAtom } from "@/store/ui.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { PrinterIcon } from "lucide-react"

import useReciept from "@/lib/useReciept"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import BillType from "./billType"

const EbarimtMain = () => {
  const unpaidAmount = useAtomValue(unPaidAmountAtom)
  const orderTotalAmount = useAtomValue(orderTotalAmountAtom)
  const setInitial = useSetAtom(setInitialAtom)
  const activeOrder = useAtomValue(activeOrderIdAtom)
  const openEbarimt = useAtomValue(ebarimtSheetAtom)
  const [openDialog, setOpenDialog] = useAtom(ebarimtMainDialogOpenAtom)
  const setCheckoutDialogOpen = useSetAtom(checkoutDialogOpenAtom)
  const { changeVisiblity, loading, disabled, printBill } = usePrintBill()

  const { iframeRef } = useReciept({
    onCompleted() {
      changeVisiblity(false)
      setInitial()
      setOpenDialog(false)
      setCheckoutDialogOpen(false)
    },
  })

  useEffect(() => {
    if (orderTotalAmount > 0 && unpaidAmount === 0) {
      setOpenDialog(true)
    }
  }, [orderTotalAmount, setOpenDialog, unpaidAmount])

  return (
    <Dialog open={openDialog} onOpenChange={() => setOpenDialog(!openDialog)}>
      <DialogTrigger asChild>
        <Button
          className="h-11 w-full rounded-xl font-semibold"
          size="lg"
          disabled={disabled}
        >
          Баримт хэвлэх
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md gap-5 rounded-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle>Төлбөрийн баримт авах</DialogTitle>
          <DialogDescription>Баримтын төрлөө сонгоно уу</DialogDescription>
        </DialogHeader>
        <BillType />
        <DialogFooter>
          <Button
            type="submit"
            disabled={disabled}
            onClick={printBill}
            loading={loading}
            className="h-11 w-full gap-1.5 rounded-xl font-semibold"
          >
            {!loading && <PrinterIcon className="h-4 w-4" />}
            Баримт хэвлэх
          </Button>
        </DialogFooter>
      </DialogContent>
      {openEbarimt && (
        <iframe
          ref={iframeRef}
          src={"/reciept/ebarimt?id=" + activeOrder}
          className="absolute w-1 h-1"
          style={{ top: 10000, left: 10000 }}
        />
      )}
    </Dialog>
  )
}

export default EbarimtMain
