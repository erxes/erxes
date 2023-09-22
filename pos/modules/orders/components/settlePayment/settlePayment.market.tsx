import usePrintBill from "@/modules/checkout/hooks/usePrintBill"
import { activeOrderAtom, setInitialAtom } from "@/store/order.store"
import { ebarimtSheetAtom } from "@/store/ui.store"
import { useAtom, useSetAtom } from "jotai"

import useReciept from "@/lib/useReciept"
import { Button } from "@/components/ui/button"

// import { Sheet, SheetContent } from "@/components/ui/sheet"

const MakePayment = () => {
  const [activeOrder] = useAtom(activeOrderAtom)
  const setInitial = useSetAtom(setInitialAtom)

  const { changeVisiblity, loading, disabled, printBill } = usePrintBill()

  const [open] = useAtom(ebarimtSheetAtom)

  const { iframeRef } = useReciept({
    onCompleted() {
      changeVisiblity(false)
      setInitial()
    },
  })

  return (
    <>
      <Button
        className="w-full bg-green-500 hover:bg-green-500/90"
        size="lg"
        disabled={disabled}
        onClick={printBill}
        loading={loading}
      >
        Баримт хэвлэх
      </Button>
      {/* <Sheet open={open} onOpenChange={() => changeVisiblity(false)}>
        <SheetContent closable className="flex flex-col p-4 sm:max-w-xs"> */}
      {open && (
        <iframe
          ref={iframeRef}
          src={"/reciept/ebarimt?id=" + activeOrder}
          className="absolute h-1 w-1"
          style={{ top: 10000, left: 10000 }}
        />
      )}
      {/* </SheetContent>
      </Sheet> */}
    </>
  )
}

export default MakePayment
