"use client"

import {
  currentAmountAtom,
  mobileTabAtom,
  paymentAmountTypeAtom,
  refetchOrderAtom,
  refetchUserAtom,
} from "@/store"
import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { Customer, CustomerType } from "@/types/customer.types"
import {
  IBillType,
  IOrder,
  IOrderType,
  IOrderUser,
  IPaidAmount,
  IPutResponse,
  OrderItem,
  PayByProductItem,
} from "@/types/order.types"

import { customerSearchAtom, selectedTabAtom } from "."
import {
  cartAtom,
  cartChangedAtom,
  orderItemInput,
  totalAmountAtom,
} from "./cart.store"
import { allowTypesAtom, permissionConfigAtom } from "./config.store"
import { paymentSheetAtom } from "./ui.store"

// order
export const activeOrderIdAtom = atomWithStorage<string | null>(
  "activeOrderId",
  null
)
export const orderNumberAtom = atom<string>("")
export const buttonTypeAtom = atom<string | null>(null)

// customer
export const customerAtom = atom<Customer | null>(null)
export const customerTypeAtom = atom<CustomerType>("")

// order type
export const orderTypeAtom = atom<IOrderType>("eat")

// ebarimt
export const registerNumberAtom = atom<string>("")
export const billTypeAtom = atom<IBillType>(null)
export const putResponsesAtom = atom<IPutResponse[]>([])
export const printTypeAtom = atom<string | null>(null)

// slot
export const slotCodeAtom = atom<string | null>(null)

// delivery
export const descriptionAtom = atom<string | null>(null)

export const dueDateAtom = atom<string | undefined>(undefined)
export const isPreAtom = atom<boolean | undefined>(undefined)

// payment
export const orderTotalAmountAtom = atom<number>(0)
export const cashAmountAtom = atom<number>(0)
export const mobileAmountAtom = atom<number>(0)
export const directDiscountAtom = atom<number>(0)
export const directDiscountTypeAtom = atom<"percent" | "amount">("amount")
export const savedDirectDiscountAtom = atom<number>(0)
export const paidAmountsAtom = atom<IPaidAmount[]>([])
export const payByProductAtom = atom<PayByProductItem[]>([])

export const splitOrderItemsAtom = atom<{
  mainItems: OrderItem[]
  subItems: OrderItem[]
}>((get) => {
  const type = get(paymentAmountTypeAtom)
  const payByIds = get(payByProductAtom).map((item) => item._id)
  if (type === "items") {
    return {
      mainItems: get(cartAtom)
        .map((item) => {
          const payByProduct = get(payByProductAtom).find(
            (product) => product._id === item._id
          )
          return {
            ...item,
            count: payByProduct ? item.count - payByProduct.count : item.count,
          }
        })
        .filter((item) => item.count > 0),
      subItems: get(cartAtom)
        .filter((item) => payByIds.includes(item._id))
        .filter((item) => item.count > 0),
    }
  }

  const percent =
    type === "percent"
      ? Number((get(currentAmountAtom) / 100).toFixed(1))
      : (get(currentAmountAtom) / get(totalAmountAtom)) * 100

  const getItems = (type: "main" | "sub") =>
    get(cartAtom).map((item) => {
      const percentCount = (item.count * percent) / 100
      return {
        ...item,
        count: type === "main" ? item.count - percentCount : percentCount,
      }
    })

  return {
    mainItems: getItems("main"),
    subItems: getItems("sub"),
  }
})
export const payByProductTotalAtom = atom<number>((get) =>
  get(payByProductAtom).reduce((prev, pr) => prev + pr.count * pr.unitPrice, 0)
)
export const paidProductsAtom = atomWithStorage<PayByProductItem[]>(
  "paidProducts",
  []
)
export const paidOrderIdAtom = atomWithStorage<string | null>(
  "paidOrderId",
  null
)

export const getTotalPaidAmountAtom = atom(
  (get) =>
    get(paidAmountsAtom).reduce((total, item) => total + item.amount, 0) +
    get(cashAmountAtom) +
    get(mobileAmountAtom)
)
export const unPaidAmountAtom = atom(
  (get) => get(orderTotalAmountAtom) - get(getTotalPaidAmountAtom)
)
export const paidDateAtom = atom<string | null>(null)

// cashier
export const orderUserAtom = atom<IOrderUser | null>(null)

// reset
export const setInitialAtom = atom(
  () => "",
  (get, set) => {
    set(mobileTabAtom, "products")
    set(cartAtom, [])
    set(customerAtom, null)
    set(customerTypeAtom, "")
    set(orderTypeAtom, (get(allowTypesAtom) || [])[0] || "eat")
    set(registerNumberAtom, "")
    set(billTypeAtom, null)
    set(slotCodeAtom, null)
    set(descriptionAtom, null)
    set(activeOrderIdAtom, null)
    set(cashAmountAtom, 0)
    set(mobileAmountAtom, 0)
    set(paidAmountsAtom, [])
    set(paidDateAtom, null)
    set(putResponsesAtom, [])
    set(orderUserAtom, null)
    set(orderNumberAtom, "")
    set(paymentSheetAtom, false)
    set(customerSearchAtom, "")
    set(dueDateAtom, undefined)
    set(isPreAtom, undefined)
    set(buttonTypeAtom, null)
    set(selectedTabAtom, "plan")
    set(directDiscountAtom, 0)
  }
)

export const setOrderStatesAtom = atom(
  () => "",
  (
    get,
    set,
    {
      _id,
      customer,
      customerType,
      items,
      type,
      billType,
      registerNumber,
      slotCode,
      description,
      cashAmount,
      mobileAmount,
      paidAmounts,
      totalAmount,
      paidDate,
      putResponses,
      user,
      number,
      dueDate,
      isPre,
      directDiscount,
    }: IOrder
  ) => {
    set(activeOrderIdAtom, _id || null)
    set(customerAtom, customer || null)

    const { directDiscount: allowDirectDiscount, directDiscountLimit } =
      get(permissionConfigAtom) || {}
    const discount = directDiscount || 0
    if (allowDirectDiscount && directDiscountLimit) {
      const discountValue =
        get(directDiscountTypeAtom) === "percent"
          ? discount
          : (totalAmount * discount) / (100 - discount)
      set(directDiscountAtom, discountValue)
      set(savedDirectDiscountAtom, discountValue)
    }

    set(customerTypeAtom, customerType || "")
    !get(cartChangedAtom) && set(cartAtom, items)
    set(orderTypeAtom, type || "eat")
    set(billTypeAtom, billType || "1")
    set(registerNumberAtom, registerNumber || "")
    set(slotCodeAtom, slotCode || null)
    set(descriptionAtom, description || null)
    set(cashAmountAtom, cashAmount || 0)
    set(mobileAmountAtom, mobileAmount || 0)
    set(paidAmountsAtom, paidAmounts || [])
    set(orderTotalAmountAtom, totalAmount || 0)
    set(paidDateAtom, paidDate || null)
    set(putResponsesAtom, putResponses || [])
    set(orderUserAtom, user || null)
    set(orderNumberAtom, number || "")
    set(customerSearchAtom, customer?.primaryPhone || customer?._id || "")
    set(dueDateAtom, dueDate)
    set(isPreAtom, isPre)
  }
)
export const setOnOrderChangeAtom = atom(
  () => {},
  (get, set) => {
    set(refetchUserAtom, true)
    set(refetchOrderAtom, true)
    set(cartChangedAtom, false)
  }
)

export const orderValuesAtom = atom((get) => ({
  items: get(orderItemInput),
  totalAmount: get(totalAmountAtom),
  directDiscount:
    get(directDiscountTypeAtom) === "percent"
      ? get(directDiscountAtom)
      : (get(directDiscountAtom) / get(totalAmountAtom)) * 100,
  type: get(orderTypeAtom),
  _id: get(activeOrderIdAtom),
  customerType: get(customerTypeAtom),
  customer: get(customerAtom) || {},
  registerNumber: get(registerNumberAtom),
  billType: get(billTypeAtom),
  slotCode: get(slotCodeAtom),
  description: get(descriptionAtom),
  buttonType: get(buttonTypeAtom),
  dueDate: get(dueDateAtom),
  isPre: get(isPreAtom),
}))
