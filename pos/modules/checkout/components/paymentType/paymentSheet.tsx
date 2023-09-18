import { useEffect } from "react"
import dynamic from "next/dynamic"
import { currentAmountAtom, currentPaymentTypeAtom } from "@/store"
import { unPaidAmountAtom } from "@/store/order.store"
import { paymentSheetAtom } from "@/store/ui.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { ALL_BANK_CARD_TYPES, BANK_CARD_TYPES } from "@/lib/constants"
import { cn, getMode } from "@/lib/utils"
import { LoaderIcon, LoaderText, LoaderWrapper } from "@/components/ui/loader"
import { Sheet, SheetContent } from "@/components/ui/sheet"

const PaymentSheet = () => {
  const [openSheet, setOpenSheet] = useAtom(paymentSheetAtom)
  const type = useAtomValue(currentPaymentTypeAtom)
  const notPaidAmount = useAtomValue(unPaidAmountAtom)
  const setCurrentAmount = useSetAtom(currentAmountAtom)
  const setCurrentPaymentType = useSetAtom(currentPaymentTypeAtom)

  useEffect(() => {
    notPaidAmount === 0 && getMode() !== "market" && setCurrentPaymentType("")
    notPaidAmount > 0 && setCurrentAmount(notPaidAmount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notPaidAmount])

  return (
    <Sheet
      open={openSheet}
      onOpenChange={() =>
        !ALL_BANK_CARD_TYPES.includes(type) && setOpenSheet(false)
      }
    >
      <SheetContent
        className={cn("flex flex-col", type === "mobile" && "sm:max-w-3xl")}
      >
        {openSheet && (
          <>
            {type === "cash" && <CashSheet />}
            {type === "mobile" && <MobileSheet />}
            {type === BANK_CARD_TYPES.KHANBANK && <KhanSheet />}
            {type === BANK_CARD_TYPES.TDB && <TDBSheet />}
            {type === BANK_CARD_TYPES.GOLOMT && <GolomtSheet />}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default PaymentSheet

const Loading = () => (
  <LoaderWrapper>
    <LoaderIcon className="mr-3 h-7 w-7" />
    <LoaderText />
  </LoaderWrapper>
)

const CashSheet = dynamic(() => import("../paymentTypes/cashSheet.market"), {
  loading: Loading,
})
const MobileSheet = dynamic(
  () => import("../paymentTypes/mobileSheet.market"),
  {
    loading: Loading,
  }
)
const KhanSheet = dynamic(() => import("../paymentTypes/khanCardSheet"), {
  loading: Loading,
})

const TDBSheet = dynamic(() => import("../paymentTypes/TDBCardSheet"), {
  loading: Loading,
})

const GolomtSheet = dynamic(() => import("../paymentTypes/golomtSheet"), {
  loading: Loading,
})
