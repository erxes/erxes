import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import usePrintBill from "@/modules/checkout/hooks/usePrintBill"
import { kioskDialogOpenAtom } from "@/store"
import {
  activeOrderIdAtom,
  mobileAmountAtom,
  orderNumberAtom,
  orderTotalAmountAtom,
  putResponsesAtom,
  setInitialAtom,
} from "@/store/order.store"
import { ebarimtSheetAtom } from "@/store/ui.store"
import { AspectRatio } from "@radix-ui/react-aspect-ratio"
import { useAtomValue, useSetAtom } from "jotai"

import useReciept from "@/lib/useReciept"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const SuccessDialog = () => {
  const number = useAtomValue(orderNumberAtom)
  const mobileAmount = useAtomValue(mobileAmountAtom)
  const orderTotalAmount = useAtomValue(orderTotalAmountAtom)

  const open = useAtomValue(ebarimtSheetAtom)
  const setInitial = useSetAtom(setInitialAtom)
  const router = useRouter()
  const activeOrder = useAtomValue(activeOrderIdAtom)
  const setKioskDialogOpen = useSetAtom(kioskDialogOpenAtom)
  const putResponses = useAtomValue(putResponsesAtom)
  const [openSuccesDialog, setOpenSuccesDialog] = useState(false)

  const { changeVisiblity, printBill } = usePrintBill()

  const { iframeRef } = useReciept({
    onCompleted() {
      changeVisiblity(false)
      setKioskDialogOpen(false)
      setOpenSuccesDialog(true)
    },
  })

  const reset = () => {
    setInitial()
    router.push("/")
  }

  useEffect(() => {
    if (!!orderTotalAmount && mobileAmount === orderTotalAmount) {
      if (!putResponses.length) {
        printBill()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileAmount, orderTotalAmount, putResponses])

  return (
    <Dialog open={openSuccesDialog}>
      <DialogContent className="max-w-full bg-transparent w-full h-screen flex flex-col justify-end items-center">
        <div className="bg-black rounded-2xl p-6 text-white w-full max-w-sm text-center flex items-center">
          <AspectRatio ratio={0.8}>
            <div className="flex flex-col gap-4 h-full justify-center space-y-2">
              <div className="text-2xl font-extrabold">
                Таны захиалгын <br />
                дугаар
              </div>
              <h1 className="text-[8rem] leading-none font-bold">
                {number.split("_")[1]}
              </h1>
              <div className="font-bold text-base">
                худалдаж авах хэсэгрүү очно уу.
              </div>
            </div>
          </AspectRatio>
        </div>
        <Button
          className="bg-black max-w-xs w-full h-20 text-lg rounded-2xl mt-6 hover:bg-black/90"
          size="lg"
          onClick={reset}
        >
          Дахин захиалах
        </Button>
        <AspectRatio ratio={5} />
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
  )
}

export default SuccessDialog
