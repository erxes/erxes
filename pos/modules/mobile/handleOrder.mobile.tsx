import dynamic from "next/dynamic"
import { checkoutDialogOpenAtom, checkoutModalViewAtom } from "@/store"
import { useAtom } from "jotai"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
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

const HandleOrder = () => {
  const [view, setView] = useAtom(checkoutModalViewAtom)

  return (
    <div className="bg-white p-2">
      <div className="flex justify-between items-center pb-2 text-base">
        <span>Нийт дүн:</span>
        <TotalAmount className="text-primary font-bold" />
      </div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button className="w-full" size="lg">
            Төлбөр төлөх
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          {!view && <SelectPaymentType />}
          {view === "paymentValue" && <PaymentType />}
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default HandleOrder
