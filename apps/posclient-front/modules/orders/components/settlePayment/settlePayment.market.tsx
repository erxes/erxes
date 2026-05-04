import usePrintBill from "@/modules/checkout/hooks/usePrintBill"
import { activeOrderIdAtom, setInitialAtom } from "@/store/order.store"
import { ebarimtSheetAtom } from "@/store/ui.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import useKeyEvent from "@/lib/useKeyEvent"
import useReciept from "@/lib/useReciept"
import { Button } from "@/components/ui/button"
import { LoaderIcon, LoaderWrapper } from "@/components/ui/loader"

const MakePayment = () => {
  const [activeOrder] = useAtom(activeOrderIdAtom)
  const setInitial = useSetAtom(setInitialAtom)

  const { changeVisiblity, loading, disabled, printBill } = usePrintBill()

  useKeyEvent(() => !(disabled || loading) && printBill(), "F5")

  const open = useAtomValue(ebarimtSheetAtom)

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
        Баримт хэвлэх F5
      </Button>

      {open && (
        <>
          <iframe
            ref={iframeRef}
            src={"/reciept/ebarimt?id=" + activeOrder}
            className="absolute h-1 w-1"
            style={{ top: 10000, left: 10000 }}
          />
          <LoaderWrapper className="fixed inset-0 bg-white/50">
            <LoaderIcon />
            <span>Хэвлэж байна...</span>
          </LoaderWrapper>
        </>
      )}
    </>
  )
}

export default MakePayment
