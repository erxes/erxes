"use client"

import { useEffect } from "react"
import CustomerType from "@/modules/customer/CustomerType"
import { queries } from "@/modules/orders/graphql"
import { refetchOrderAtom } from "@/store"
import { activeOrderIdAtom } from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtom, useAtomValue } from "jotai"
import { CheckCircle2Icon } from "lucide-react"

import { IPaidAmount } from "@/types/order.types"
import { getCustomerLabel } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import Cart from "./components/cart"

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

  const { paidAmounts, mobileAmount, cashAmount, customer } = data?.orderDetail

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
            {paidAmounts.map((el: IPaidAmount) => (
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
        </div>
      </div>
      <Dialog open={false}>
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
    </div>
  )
}

export default Extended
