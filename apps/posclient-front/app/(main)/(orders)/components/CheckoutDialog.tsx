"use client"

import { useEffect } from "react"
import EbarimtMain from "@/modules/checkout/components/ebarimt/ebarimt.main"
import PaymentSheet from "@/modules/checkout/components/paymentType/paymentSheet"
import PaymentType from "@/modules/checkout/components/paymentType/PaymentType"
import SelectPaymentTypeMain from "@/modules/checkout/components/paymentType/selectPaymentType.main"
import usePaymentLabel from "@/modules/checkout/hooks/usePaymentLabel"
import OrderDetail from "@/modules/orders/OrderDetail"
import {
  checkoutDialogOpenAtom,
  currentPaymentTypeAtom,
  ebarimtMainDialogOpenAtom,
} from "@/store"
import {
  orderNumberAtom,
  orderTotalAmountAtom,
  unPaidAmountAtom,
} from "@/store/order.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  HashIcon,
  PrinterIcon,
  XIcon,
} from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

import PaidTypes from "../../../../modules/checkout/components/paymentType/paidTypes"

const PaymentSection = () => {
  const [paymentTerm, setPaymentTerm] = useAtom(currentPaymentTypeAtom)
  const { getLabel } = usePaymentLabel()
  const open = useAtomValue(checkoutDialogOpenAtom)
  const unpaid = useAtomValue(unPaidAmountAtom)
  const totalAmount = useAtomValue(orderTotalAmountAtom)
  const setEbarimtOpen = useSetAtom(ebarimtMainDialogOpenAtom)
  const isPaid = totalAmount > 0 && unpaid === 0

  useEffect(() => {
    if (isPaid && paymentTerm) {
      setPaymentTerm("")
    }
  }, [isPaid, paymentTerm, setPaymentTerm])

  useEffect(() => {
    if (open && !paymentTerm) {
      setPaymentTerm("")
    }
  }, [open, paymentTerm, setPaymentTerm])

  return (
    <section className="flex min-w-0 flex-auto flex-col overflow-hidden">
      <header className="flex h-16 flex-none items-center gap-3 border-b px-6">
        {paymentTerm && !isPaid && (
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 h-8 w-8"
            aria-label="Буцах"
            onClick={() => setPaymentTerm("")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        )}
        <div className="min-w-0">
          <DialogTitle className="truncate text-base font-semibold">
            {paymentTerm ? getLabel(paymentTerm) : "Төлбөр төлөх"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isPaid
              ? "Төлбөр төлөгдсөн"
              : paymentTerm
                ? "Төлөх дүнгээ оруулаад гүйлгээ хийнэ үү"
                : "Төлбөрийн нөхцөлөө сонгоно уу"}
          </DialogDescription>
        </div>
      </header>
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-6">
          {isPaid ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2Icon className="h-7 w-7" />
              </span>
              <div>
                <p className="text-base font-semibold">
                  Төлбөр бүрэн төлөгдлөө
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Баримтаа хэвлэж захиалгаа дуусгана уу
                </p>
              </div>
              <Button
                className="mt-2 h-11 gap-1.5 rounded-xl px-6 font-semibold"
                onClick={() => setEbarimtOpen(true)}
              >
                <PrinterIcon className="h-4 w-4" />
                Баримт хэвлэх
              </Button>
            </div>
          ) : paymentTerm ? (
            <PaymentType />
          ) : (
            <SelectPaymentTypeMain />
          )}
        </div>
      </ScrollArea>
    </section>
  )
}

const DetailSection = () => {
  const number = useAtomValue(orderNumberAtom)
  const unpaid = useAtomValue(unPaidAmountAtom)
  const totalAmount = useAtomValue(orderTotalAmountAtom)
  const paid = Math.max(totalAmount - unpaid, 0)
  const progress = totalAmount ? Math.min((paid / totalAmount) * 100, 100) : 0
  const isPaid = totalAmount > 0 && unpaid === 0

  return (
    <div className="flex flex-auto flex-col">
      <div className="flex h-16 flex-none items-center justify-between border-b px-5">
        <div className="flex items-center gap-1 text-sm font-semibold">
          <HashIcon className="h-4 w-4 text-muted-foreground" />
          {(number || "").split("_")[1] || "—"}
        </div>
        <DialogPrimitive.Close asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Хаах"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </DialogPrimitive.Close>
      </div>

      <div className="flex-none space-y-4 px-5 py-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Нийт төлөх
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
            {totalAmount.toLocaleString()}₮
          </p>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 overflow-hidden rounded-full bg-primary/10">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500",
                isPaid ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Төлсөн {paid.toLocaleString()}₮</span>
            {isPaid ? (
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <CheckCircle2Icon className="h-3.5 w-3.5" />
                Бүрэн төлөгдсөн
              </span>
            ) : (
              <span>{Math.round(progress)}%</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-auto space-y-1 border-t px-5 py-4">
        <PaidTypes />
        {paid === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Төлбөр хийгдээгүй байна
          </p>
        )}
      </div>

      <div className="flex-none space-y-3 border-t px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Үлдэгдэл
          </span>
          <span
            className={cn(
              "text-xl font-bold tabular-nums",
              isPaid ? "text-emerald-600" : "text-primary"
            )}
          >
            {unpaid.toLocaleString()}₮
          </span>
        </div>
        <EbarimtMain />
      </div>
    </div>
  )
}

const CheckoutDialog = () => {
  const [open, setOpen] = useAtom(checkoutDialogOpenAtom)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex h-[min(620px,90vh)] w-[min(960px,94vw)] max-w-none gap-0 overflow-hidden rounded-2xl p-0 md:w-[min(960px,94vw)] [&>button]:hidden">
        <OrderDetail>
          <div className="flex h-full w-full min-w-[760px] items-stretch overflow-hidden">
            <PaymentSection />
            <aside className="flex w-[320px] flex-none flex-col border-l bg-muted/40">
              <DetailSection />
            </aside>
          </div>
          <PaymentSheet />
        </OrderDetail>
      </DialogContent>
    </Dialog>
  )
}

export default CheckoutDialog
