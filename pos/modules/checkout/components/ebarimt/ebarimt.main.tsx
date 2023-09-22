import { useRouter } from "next/navigation"
import usePrintBill from "@/modules/checkout/hooks/usePrintBill"
import {
  activeOrderAtom,
  setInitialAtom,
  unPaidAmountAtom,
} from "@/store/order.store"
import { ebarimtSheetAtom } from "@/store/ui.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import useReciept from "@/lib/useReciept"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import BillType from "./billType"

const EbarimtMain = () => {
  const unpaidAmount = useAtomValue(unPaidAmountAtom)
  const setInitial = useSetAtom(setInitialAtom)
  const activeOrder = useAtomValue(activeOrderAtom)
  const [open] = useAtom(ebarimtSheetAtom)
  const router = useRouter()

  const { changeVisiblity, loading, disabled, printBill } = usePrintBill()
  const { iframeRef } = useReciept({
    onCompleted() {
      changeVisiblity(false)
      setInitial()
      router.push("/")
    },
  })

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="font-bold bg-green-500 hover:bg-green-400"
            size="lg"
            disabled={unpaidAmount > 0}
          >
            Баримт хэвлэх
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Төлбөрийн баримт авах</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 h-36 min-h-fit">
            <BillType />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={disabled}
              onClick={printBill}
              loading={loading}
              className="font-semibold"
            >
              Баримт хэвлэх
            </Button>
          </DialogFooter>
        </DialogContent>
        {open && (
          <iframe
            ref={iframeRef}
            src={"/reciept/ebarimt?id=" + activeOrder}
            className="absolute h-1 w-1"
            style={{ top: 10000, left: 10000 }}
          />
        )}
      </Dialog>
    </>
  )
}

export default EbarimtMain
