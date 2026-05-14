import { useEffect } from "react"
import dynamic from "next/dynamic"
import { checkoutDialogOpenAtom, checkoutModalViewAtom } from "@/store"
import {
  orderTotalAmountAtom,
  paidDateAtom,
  unPaidAmountAtom,
} from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import Loader from "@/components/ui/loader"

import TotalAmount from "../checkout/components/totalAmount/totalAmount.kiosk"

const SelectPaymentType: any = dynamic(
  () =>
    import(
      "@/modules/checkout/components/paymentType/selectPaymentType.mobile"
    ),
  {
    loading: () => <Loader className="min-h-[15rem]" />,
  }
)

const PaymentType: any = dynamic(
  () => import("@/modules/checkout/components/paymentType/paymentType.mobile"),
  {
    loading: () => <Loader className="min-h-[15rem]" />,
  }
)

const BillType: any = dynamic(
  () => import("@/modules/checkout/components/ebarimt/billType.mobile"),
  {
    loading: () => <Loader className="min-h-[15rem]" />,
  }
)

const Ebarimt: any = dynamic(
  () => import("@/modules/checkout/components/ebarimt/ebarimtView.mobile"),
  {
    loading: () => <Loader className="min-h-[15rem]" />,
  }
)

const HandleOrder = () => {
  const [open, setOpen] = useAtom(checkoutDialogOpenAtom)
  const [view, setView] = useAtom(checkoutModalViewAtom)
  const totalAmount = useAtomValue(orderTotalAmountAtom)
  const notPaidAmount = useAtomValue(unPaidAmountAtom)
  const paidDate = useAtomValue(paidDateAtom)

  useEffect(() => {
    if (paidDate) {
      setView("ebarimt")
      return
    }
    if (totalAmount > 0 && notPaidAmount === 0) {
      setView("billType")
    }
  }, [totalAmount, notPaidAmount, setView])

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
            {view === "ebarimt" && <Ebarimt />}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

export default HandleOrder
