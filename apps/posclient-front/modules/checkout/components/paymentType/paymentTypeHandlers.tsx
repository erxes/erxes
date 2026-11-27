import { modeAtom, paymentAmountTypeAtom } from "@/store"
import { useAtom, useAtomValue } from "jotai"

import { IPaymentAmountType } from "@/types/order.types"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Keys from "@/app/(main)/checkout/components/Keys"

import PayByProduct from "./PayByProduct"

const PaymentTypeHandlers = () => {
  const [paymentAmountType, setPaymentAmountType] = useAtom(
    paymentAmountTypeAtom
  )
  const mode = useAtomValue(modeAtom)

  return (
    <Tabs
      defaultValue="amount"
      value={paymentAmountType}
      onValueChange={(value) =>
        setPaymentAmountType(value as IPaymentAmountType)
      }
    >
      <TabsList
        className={cn(
          "grid w-full flex-none grid-cols-3",
          mode === "mobile" ? "my-4" : "mb-3 h-10 rounded-xl"
        )}
      >
        <TabsTrigger value="amount">Дүнгээр</TabsTrigger>
        <TabsTrigger value="percent">Хувиар</TabsTrigger>
        <TabsTrigger value="items">Бараагаар</TabsTrigger>
      </TabsList>
      <TabsContent value="amount">
        <Keys />
      </TabsContent>
      <TabsContent value="percent">
        <Keys />
      </TabsContent>
      <TabsContent value="items" className="flex-auto">
        <PayByProduct />
      </TabsContent>
    </Tabs>
  )
}

export default PaymentTypeHandlers
