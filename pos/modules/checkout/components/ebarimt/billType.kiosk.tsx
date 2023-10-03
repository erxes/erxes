import useOrderCU from "@/modules/orders/hooks/useOrderCU"
import { kioskModalView } from "@/store"
import { billTypeAtom } from "@/store/order.store"
import { useAtom, useSetAtom } from "jotai"

import { IBillType } from "@/types/order.types"
import { Button } from "@/components/ui/button"
import { DialogContent } from "@/components/ui/dialog"

const BillType = () => {
  const [billType, setBillType] = useAtom(billTypeAtom)
  const setView = useSetAtom(kioskModalView)

  const { loading: loadingEdit, orderCU } = useOrderCU(() => {
    billType === "1" && setView("choosePay")
    billType === "3" && setView("registerNumber")
  })

  const handleChoose = (type: IBillType) => {
    setBillType(type)
    setTimeout(() => orderCU())
  }

  return (
    <DialogContent className="bg-black text-white min-h-[15rem]">
      <h2 className="text-3xl font-black text-center">
        Та баримтын төрлөө <br /> сонгоно уу!
      </h2>
      <div className="pt-4 pb-5 flex flex-col space-y-3">
        <Button
          className="text-lg h-16 hover:bg-white/10 hover:text-white"
          variant="outline"
          size="lg"
          onClick={() => handleChoose("1")}
          loading={billType === "1" && loadingEdit}
          disabled={loadingEdit}
        >
          Хувь хүнээр
        </Button>
        <Button
          className="text-lg h-16 hover:bg-white/10 hover:text-white"
          variant="outline"
          size="lg"
          onClick={() => handleChoose("3")}
          loading={billType === "3" && loadingEdit}
          disabled={loadingEdit}
        >
          Байгууллагаар
        </Button>
      </div>
    </DialogContent>
  )
}

export default BillType
