import dynamic from "next/dynamic"
import {
  checkoutDialogOpenAtom,
  currentPaymentTypeAtom,
  modeAtom,
} from "@/store"
import { paymentSheetAtom } from "@/store/ui.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { XIcon } from "lucide-react"

import { ALL_BANK_CARD_TYPES, BANK_CARD_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LoaderIcon, LoaderText, LoaderWrapper } from "@/components/ui/loader"
import { Sheet, SheetContent } from "@/components/ui/sheet"

import HandleNotPaidAmount from "./HandleNotPaidAmount"

const PaymentSheet = () => {
  const [openSheet, setOpenSheet] = useAtom(paymentSheetAtom)
  const setOpenDialog = useSetAtom(checkoutDialogOpenAtom)
  const type = useAtomValue(currentPaymentTypeAtom)
  const mode = useAtomValue(modeAtom)
  const isKiosk = mode === "kiosk"

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
            type === "mobile" && "sm:max-w-3xl p-0",
            isKiosk && "h-2/3 rounded-t-3xl sm:max-w-none"
          )}
          side={isKiosk ? "bottom" : undefined}
        >
          {mode === "mobile" && (
            <Button
              variant="secondary"
              className="absolute right-4 top-4"
              onClick={() => {
                setOpenSheet(false)
                setOpenDialog(true)
              }}
            >
              <XIcon strokeWidth={1.5} className="h-5 w-5 mr-1 -ml-1" /> Хаах
            </Button>
          )}
          {type === "mobile" && <MobileSheet />}
          {type === BANK_CARD_TYPES.KHANBANK && <KhanSheet />}
          {type === BANK_CARD_TYPES.TDB && <TDBSheet />}
          {type === BANK_CARD_TYPES.CAPITRON && <CapitronSheet />}
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

const MobileSheet: any = dynamic(() => import("../paymentTypes/mobileSheet"))
const KhanSheet: any = dynamic(() => import("../paymentTypes/khanCardSheet"), {
  loading: Loading,
})

const TDBSheet: any = dynamic(() => import("../paymentTypes/TDBCardSheet"), {
  loading: Loading,
})
const CapitronSheet: any = dynamic(
  () => import("../paymentTypes/capitronSheet"),
  {
    loading: Loading,
  }
)

const GolomtSheet: any = dynamic(() => import("../paymentTypes/golomtSheet"), {
  loading: Loading,
})
