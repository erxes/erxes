import { ChangeEvent, useEffect } from "react"
import { currentPaymentTypeAtom, paymentAmountTypeAtom } from "@/store"
import {
  activeOrderIdAtom,
  orderTotalAmountAtom,
  paidOrderIdAtom,
  paidProductsAtom,
  payByProductAtom,
  payByProductTotalAtom,
} from "@/store/order.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Percent, XIcon } from "lucide-react"

import { IPaymentAmountType } from "@/types/order.types"
import { HARD_PAYMENT_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toggle } from "@/components/ui/toggle"
import Keys from "@/app/(main)/checkout/components/Keys"

import useHandlePayment from "../../hooks/useHandlePayment"
import { useCheckNotSplit } from "../../hooks/usePaymentType"
import PayByProduct from "./PayByProduct"

const PaymentType = () => {
  const [paymentAmountType, setPaymentAmountType] = useAtom(
    paymentAmountTypeAtom
  )
  const [paidProducts, setPaidProducts] = useAtom(paidProductsAtom)
  const [payByProduct, setPayByProduct] = useAtom(payByProductAtom)
  const payByProductTotal = useAtomValue(payByProductTotalAtom)
  const setPaidOrderId = useSetAtom(paidOrderIdAtom)
  const orderIdAtom = useAtomValue(activeOrderIdAtom)

  const setPaymentTerm = useSetAtom(currentPaymentTypeAtom)
  const totalAmount = useAtomValue(orderTotalAmountAtom)
  const {
    handleValueChange,
    handlePay,
    loading,
    currentAmount,
    notPaidAmount,
    type,
  } = useHandlePayment()
  const { disableInput } = useCheckNotSplit()

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (paymentAmountType === "amount") return handleValueChange(e.target.value)
    if (paymentAmountType === "percent")
      return handleValueChange(
        ((Number(e.target.value) / 100) * totalAmount).toString()
      )
  }

  useEffect(() => {
    if (paymentAmountType === "items" && payByProductTotal > 0) {
      handleValueChange(
        (payByProductTotal > notPaidAmount
          ? notPaidAmount
          : payByProductTotal
        ).toString()
      )
    }
  }, [paymentAmountType, payByProductTotal, handleValueChange, notPaidAmount])

  const value =
    paymentAmountType === "percent"
      ? (currentAmount / totalAmount) * 100
      : currentAmount

  const mergePaid = () => {
    const mergedArray = payByProduct.reduce(
      (result, obj1) => {
        const existingObj = result.find((obj2) => obj2._id === obj1._id)

        if (existingObj) {
          // If _id exists, add counts
          existingObj.count += obj1.count
        } else {
          // If _id doesn't exist, push the object to the result array
          result.push({ ...obj1 })
        }

        return result
      },
      [...paidProducts]
    )
    setPaidProducts(mergedArray)
    setPaidOrderId(orderIdAtom)
    setPayByProduct([])
  }

  return (
    <>
      <div className="flex justify-between items-center p-1 border-b border-white/20 pb-2 mb-4">
        <div className="flex-auto">
          <div className="flex items-center text-3xl font-black mb-2">
            <Toggle
              className="text-3xl font-black w-11 px-2"
              colorMode="dark"
              pressed={paymentAmountType === "percent"}
              onPressedChange={(pressed) =>
                setPaymentAmountType(pressed ? "percent" : "amount")
              }
            >
              {paymentAmountType === "percent" ? (
                <Percent className="h-6 w-6" strokeWidth={3} />
              ) : (
                "₮"
              )}
            </Toggle>
            <Input
              className="border-none px-2 "
              focus={false}
              value={value.toLocaleString()}
              onChange={onChange}
              disabled={disableInput || paymentAmountType === "items"}
            />
          </div>
          <span className="text-slate-300">
            Үлдэгдэл: {(notPaidAmount - currentAmount).toLocaleString()}₮
          </span>
        </div>
        <div className="flex-auto flex items-center">
          <Button
            className="bg-green-500 hover:bg-green-500/90 whitespace-nowrap font-bold"
            loading={loading}
            onClick={() => {
              handlePay()
              mergePaid()
            }}
            disabled={
              HARD_PAYMENT_TYPES.includes(type) &&
              (notPaidAmount === 0 || currentAmount === 0)
            }
          >
            Гүйлгээ хийх
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="px-2 h-8 hover:bg-slate-900 hover:text-white"
            onClick={() => setPaymentTerm("")}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Tabs
        defaultValue="amount"
        value={paymentAmountType}
        onValueChange={(value) =>
          setPaymentAmountType(value as IPaymentAmountType)
        }
      >
        <TabsList className="grid w-full grid-cols-3 bg-neutral-700 text-white/80 my-4 flex-none">
          <TabsTrigger
            value="amount"
            className="data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Дүнгээр
          </TabsTrigger>
          <TabsTrigger
            value="percent"
            className="data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Хувиар
          </TabsTrigger>
          <TabsTrigger
            value="items"
            className="data-[state=active]:bg-black data-[state=active]:text-white"
          >
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
    </>
  )
}

export default PaymentType
