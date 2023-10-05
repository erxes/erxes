import dynamic from "next/dynamic"
import { currentPaymentTypeAtom } from "@/store"
import { paymentSheetAtom } from "@/store/ui.store"
import { useAtom, useAtomValue } from "jotai"

import { ALL_BANK_CARD_TYPES, BANK_CARD_TYPES } from "@/lib/constants"
import { cn, getMode } from "@/lib/utils"
import { LoaderIcon, LoaderText, LoaderWrapper } from "@/components/ui/loader"
import { Sheet, SheetContent } from "@/components/ui/sheet"

import HandleNotPaidAmount from "./HandleNotPaidAmount"

const mode = getMode()

const isKiosk = mode === "kiosk"

const PaymentSheet = () => {
  const [openSheet, setOpenSheet] = useAtom(paymentSheetAtom)
  const type = useAtomValue(currentPaymentTypeAtom)

  return (
    <>
      <Sheet
        open={openSheet}
        onOpenChange={() =>
          !ALL_BANK_CARD_TYPES.includes(type) && setOpenSheet(false)
        }
      >
        <SheetContent
          className={cn(
            "flex flex-col",
            type === "mobile" && "sm:max-w-3xl",
            isKiosk && "h-2/3 rounded-t-3xl"
          )}
          side={isKiosk ? "bottom" : undefined}
        >
          {type === "mobile" && <MobileSheet />}
          {type === BANK_CARD_TYPES.KHANBANK && <KhanSheet />}
          {type === BANK_CARD_TYPES.TDB && <TDBSheet />}
          {type === BANK_CARD_TYPES.GOLOMT && <GolomtSheet />}
        </SheetContent>
      </Sheet>
      <HandleNotPaidAmount />
    </>
  )
}

export default PaymentSheet

const Loading = () => (
  <LoaderWrapper>
    <LoaderIcon className="mr-3 h-7 w-7" />
    <LoaderText />
  </LoaderWrapper>
)

const MobileSheet = dynamic(() => import("../paymentTypes/mobileSheet"))
const KhanSheet = dynamic(() => import("../paymentTypes/khanCardSheet"), {
  loading: Loading,
})

const TDBSheet = dynamic(() => import("../paymentTypes/TDBCardSheet"), {
  loading: Loading,
})

const GolomtSheet = dynamic(() => import("../paymentTypes/golomtSheet"), {
  loading: Loading,
})
