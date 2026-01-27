"use client"

import { useEffect } from "react"
import EbarimtMain from "@/modules/checkout/components/ebarimt/ebarimt.main"
import PaymentSheet from "@/modules/checkout/components/paymentType/paymentSheet"
import PaymentType from "@/modules/checkout/components/paymentType/PaymentType"
import SelectPaymentTypeMain from "@/modules/checkout/components/paymentType/selectPaymentType.main"
import usePaymentLabel from "@/modules/checkout/hooks/usePaymentLabel"
import OrderDetail from "@/modules/orders/OrderDetail"
import { checkoutDialogOpenAtom, currentPaymentTypeAtom } from "@/store"
import {
  orderNumberAtom,
  orderTotalAmountAtom,
  unPaidAmountAtom,
} from "@/store/order.store"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { useAtom, useAtomValue } from "jotai"
import { CheckCircle2Icon, CircleIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

import PaidType from "../../../../modules/checkout/components/paymentType/paidType.main"
import PaidTypes from "../../../../modules/checkout/components/paymentType/paidTypes"

const PaymentSection = () => {
  const [paymentTerm, setPaymentTerm] = useAtom(currentPaymentTypeAtom)
  const { getLabel } = usePaymentLabel()
  const open = useAtomValue(checkoutDialogOpenAtom)

  useEffect(() => {
    if (open && !paymentTerm) {
      setPaymentTerm("")
    }
  }, [open, paymentTerm, setPaymentTerm])

  return (
    <div className="flex overflow-hidden flex-col mr-4 w-7/12">
      <h2 className="mb-3 text-base font-bold">
        {paymentTerm
          ? getLabel(paymentTerm) + ":"
          : "Төлбөрийн нөхцөлөө сонгоно уу."}{" "}
      </h2>
      <ScrollArea className="flex-1">
        {paymentTerm ? <PaymentType /> : <SelectPaymentTypeMain />}
      </ScrollArea>
    </div>
  )
}

const DetailSection = () => {
  const number = useAtomValue(orderNumberAtom)
  const unpaid = useAtomValue(unPaidAmountAtom)
  const totalAmount = useAtomValue(orderTotalAmountAtom)

  return (
    <div className="flex flex-col flex-auto gap-3 items-center pt-4">
      <h2 className="pb-5 text-base font-black text-center text-slate-600">
        Захиалын дугаар: {(number || "").split("_")[1]}
      </h2>
      <div className="flex justify-center items-center h-20">
        {unpaid === 0 ? (
          <CheckCircle2Icon className="w-20 h-20 text-emerald-600 animate-bounce" />
        ) : (
          <CircleIcon className="w-20 h-20 text-slate-400" />
        )}
      </div>
      <div className="text-center">
        <h1 className="text-xl font-black">{totalAmount.toLocaleString()}</h1>
        <p className="text-semibold text-slate-600">Нийт төлөх</p>
      </div>
      <div className="flex flex-col items-center w-full">
        <PaidTypes />
        <PaidType type="Үлдэгдэл дүн" amount={unpaid} />
      </div>
    </div>
  )
}

const CheckoutDialog = () => {
  const [open, setOpen] = useAtom(checkoutDialogOpenAtom)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[75vw] h-[680px] p-0 bg-black text-white border-slate-800 [&>button]:hidden">
        <DialogPrimitive.Close asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white rounded-full bg-white/10 hover:bg-white/20 hover:text-white"
          >
            <XIcon className="w-5 h-5" />
          </Button>
        </DialogPrimitive.Close>
        <OrderDetail>
          <div className="flex h-full w-auto min-w-[880px] items-stretch p-4 overflow-hidden">
            <PaymentSection />
            <div className="flex flex-col p-5 w-5/12 text-black bg-white rounded-3xl">
              <DetailSection />
              <EbarimtMain />
            </div>
          </div>
          <PaymentSheet />
        </OrderDetail>
      </DialogContent>
    </Dialog>
  )
}

export default CheckoutDialog