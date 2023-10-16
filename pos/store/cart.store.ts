import { atom } from "jotai"

import {
  IOrderItemStatus,
  OrderItem,
  OrderItemInput,
} from "@/types/order.types"
import { IProduct } from "@/types/product.types"
import { ORDER_STATUSES } from "@/lib/constants"

interface IUpdateItem {
  _id: string
  count?: number
  isTake?: boolean
  description?: string
  attachment?: { url?: string } | null
}

export const changeCartItem = (
  product: IUpdateItem,
  cart: OrderItem[]
): OrderItem[] => {
  const { _id, count, ...rest } = product

  const currentItem = cart.find((item) => item._id === _id) || ({} as OrderItem)
  const exceptCurrent = cart.filter((item) => item._id !== _id)

  const fieldKeys = Object.keys(rest)
  if (fieldKeys.length) {
    for (let key = 0; key < fieldKeys.length; key++) {
      const value = rest[fieldKeys[key] as keyof typeof rest]
      if (typeof value !== "undefined") {
        return [{ ...currentItem, [fieldKeys[key]]: value }, ...exceptCurrent]
      }
    }
  }

  if (typeof count !== "undefined") {
    if (count === -1) return exceptCurrent

    return [{ ...currentItem, count }, ...exceptCurrent]
  }

  return cart
}

export const addToCart = (
  product: IProduct,
  cart: OrderItem[]
): OrderItem[] => {
  const prevItem = cart.find(
    ({
      productId,
      status,
      manufacturedDate,
      isTake,
      description,
      attachment,
    }) =>
      productId === product._id &&
      status === ORDER_STATUSES.NEW &&
      manufacturedDate == product.manufacturedDate &&
      !isTake &&
      !description &&
      !attachment
  )

  if (prevItem) {
    const { _id, count } = prevItem
    return changeCartItem({ _id, count: count + 1 }, cart)
  }

  const { unitPrice, _id, name, attachment } = product

  const cartItem = {
    _id: Math.random().toString(),
    productId: _id,
    count: 1,
    unitPrice,
    productName: name,
    status: ORDER_STATUSES.NEW as IOrderItemStatus,
    productImgUrl: attachment?.url,
  }

  return [cartItem, ...cart]
}

// Atoms
// cart
export const cartAtom = atom<OrderItem[]>([])
export const orderItemInput = atom<OrderItemInput[]>((get) =>
  get(cartAtom).map(
    ({
      _id,
      productId,
      count,
      unitPrice,
      isPackage,
      isTake,
      status,
      manufacturedDate,
      description,
      attachment,
    }) => ({
      _id,
      productId,
      count,
      unitPrice,
      isPackage,
      isTake,
      status,
      manufacturedDate,
      description,
      attachment,
    })
  )
)
export const totalAmountAtom = atom<number>((get) =>
  (get(cartAtom) || []).reduce(
    (total, item) => total + item.count * item.unitPrice,
    0
  )
)
export const addToCartAtom = atom(
  () => "",
  (get, set, update: IProduct) => {
    set(cartAtom, addToCart(update, get(cartAtom)))
  }
)
export const updateCartAtom = atom(
  () => "",
  (get, set, update: IUpdateItem) => {
    set(cartAtom, changeCartItem(update, get(cartAtom)))
  }
)
export const setCartAtom = atom(
  () => "",
  (get, set, update: OrderItem[]) => {
    set(cartAtom, update)
  }
)
