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
  const triggerClassName =
    mode !== "mobile"
      ? "text-white data-[state=active]:bg-black data-[state=active]:text-white"
      : undefined

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
          "grid w-full grid-cols-3 my-4 flex-none",
          mode !== "mobile" && "bg-neutral-700"
        )}
      >
        <TabsTrigger value="amount" className={triggerClassName}>
          Дүнгээр
        </TabsTrigger>
        <TabsTrigger value="percent" className={triggerClassName}>
          Хувиар
        </TabsTrigger>
        <TabsTrigger value="items" className={triggerClassName}>
          Бараагаар
        </TabsTrigger>
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
