import SelectPaymentType from "@/modules/checkout/components/paymentType/selectPaymentType.mobile"
import { checkoutModalView } from "@/store"
import { useAtom } from "jotai"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"

const HandleOrder = () => {
  const [view, setView] = useAtom(checkoutModalView)
  return (
    <div className="bg-white p-1">
      <div className="flex justify-between items-center"></div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button className="w-full" size="lg">
            Төлбөр төлөх
          </Button>
        </DrawerTrigger>
        <DrawerContent>{!view && <SelectPaymentType />}</DrawerContent>
      </Drawer>
    </div>
  )
}

export default HandleOrder
