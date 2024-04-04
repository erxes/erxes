"use client"

import { useEffect } from "react"
import CustomerType from "@/modules/customer/CustomerType"
import { queries } from "@/modules/orders/graphql"
import { refetchOrderAtom } from "@/store"
import { activeOrderIdAtom } from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtom, useAtomValue } from "jotai"
import { CheckCircle2Icon, Hash } from "lucide-react"

import { IPaidAmount } from "@/types/order.types"
import { formatNum, getCustomerLabel } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import Cart from "./components/cart"
import PaymentDialog from "./components/paymentDialog"

const Extended = () => {
  const _id = useAtomValue(activeOrderIdAtom)

  const [refetchOrder, setRefetchOrder] = useAtom(refetchOrderAtom)
  const { data, loading, refetch } = useQuery(queries.orderDetail, {
    variables: {
      _id,
    },
  })

  useEffect(() => {
    if (refetchOrder) {
      refetch()
      setRefetchOrder(false)
    }
  }, [refetch, refetchOrder, setRefetchOrder])

  if (loading) return null

  const {
    paidAmounts,
    mobileAmount,
    cashAmount,
    customer,
    totalAmount,
    number,
  } = data?.orderDetail || {}

  const unPaidAmount =
    totalAmount -
    ((paidAmounts || []).reduce(
      (total: number, item: { amount: number }) => total + item.amount,
      0
    ) +
      cashAmount +
      mobileAmount)

  return (
    <div className="flex flex-auto items-stretch overflow-hidden px-5">
      <div
        className="relative flex h-full w-2/3 flex-col overflow-hidden py-4 pr-4
      "
      >
        <Cart />
      </div>
      <div className="flex w-1/3 flex-col border-l p-4 pr-0 relative">
        <div className="flex items-center gap-1 relative">
          <CustomerType className="h-5 w-5" />
          <Input
            value={getCustomerLabel(customer || {})}
            placeholder="Хэрэглэгч сонгох"
          />
        </div>
        <div className="mt-2 flex flex-auto flex-col pt-2">
          <div className="flex-auto">
            <Label className="block pb-2">Төлбөрийн төрөл:</Label>
            {cashAmount > 0 && (
              <div className="flex flex-auto gap-2 pb-2">
                <div className="w-1/2">
                  <Input value="Бэлнээр" />
                </div>
                <div className="w-1/2">
                  <Input value={cashAmount.toLocaleString()} />
                </div>
              </div>
            )}
            {mobileAmount > 0 && (
              <div className="flex flex-auto gap-2 pb-2">
                <div className="w-1/2">
                  <Input value="Бэлнээр" />
                </div>
                <div className="w-1/2">
                  <Input value={mobileAmount.toLocaleString()} />
                </div>
              </div>
            )}
            {(paidAmounts || []).map((el: IPaidAmount) => (
              <div className="flex flex-auto gap-2 pb-2" key={el._id}>
                <div className="w-1/2">
                  <Input value={el.type} />
                </div>
                <div className="w-1/2">
                  <Input value={(el.amount || "").toLocaleString()} />
                </div>
              </div>
            ))}
          </div>
          {!!number && (
            <div className="flex-none flex flex-col gap-2 pb-1">
              <div className="flex items-center justify-between text-slate-500 pl-12">
                <span>Зөрүү дүн:</span>
                <span>{unPaidAmount.toLocaleString()}₮</span>
              </div>
              <div className="col-span-2 flex items-center justify-between text-base font-extrabold leading-none">
                <div className="flex items-baseline gap-0.5 mr-2">
                  {number && <Hash className="h-3 w-3" strokeWidth={3} />}
                  <div className="font-black leading-none">
                    {number?.split("_")[1]}
                  </div>
                  <small className="font-normal text-xs leading-none">
                    {number?.split("_")[0]}
                  </small>
                </div>
                <div>{formatNum(totalAmount)}₮</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Dialog open={unPaidAmount === 0}>
        <DialogContent>
          <div className="flex flex-col items-center py-14 gap-5">
            <CheckCircle2Icon
              className="h-20 w-20 text-green-500 animate-bounce "
              strokeWidth={1.5}
            />
            <p className="text-center text-base font-medium">
              Төлбөр амжилттай төлөгдлөө
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <PaymentDialog />
    </div>
  )
}

export default Extended
