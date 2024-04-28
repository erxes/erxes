import { useEffect } from "react"
import dynamic from "next/dynamic"
import { checkoutDialogOpenAtom, checkoutModalViewAtom } from "@/store"
import { unPaidAmountAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import Loader from "@/components/ui/loader"

import TotalAmount from "../checkout/components/totalAmount/totalAmount.kiosk"

const SelectPaymentType = dynamic(
  () =>
    import(
      "@/modules/checkout/components/paymentType/selectPaymentType.mobile"
    ),
  {
    loading: () => <Loader className="min-h-[15rem]" />,
  }
)

const PaymentType = dynamic(
  () => import("@/modules/checkout/components/paymentType/paymentType.mobile"),
  {
    loading: () => <Loader className="min-h-[15rem]" />,
  }
)

const BillType = dynamic(
  () => import("@/modules/checkout/components/ebarimt/billType.mobile"),
  {
    loading: () => <Loader className="min-h-[15rem]" />,
  }
)
const HandleOrder = () => {
  const [open, setOpen] = useAtom(checkoutDialogOpenAtom)
  const [view, setView] = useAtom(checkoutModalViewAtom)
  const notPaidAmount = useAtomValue(unPaidAmountAtom)

  useEffect(() => {
    if (notPaidAmount === 0) {
      setView("billType")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notPaidAmount])

  return (
    <div className="bg-white p-2">
      <div className="flex justify-between items-center pb-2 text-base">
        <span>Нийт дүн:</span>
        <TotalAmount className="text-primary font-bold" />
      </div>
      <Button className="w-full" size="lg" onClick={() => setOpen(true)}>
        Төлбөр төлөх
      </Button>
      {open && (
        <Drawer open={open} onOpenChange={(op) => setOpen(op)}>
          <DrawerContent>
            {view === "" && <SelectPaymentType />}
            {view === "paymentValue" && <PaymentType />}
            {view === "billType" && <BillType />}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

export default HandleOrder
