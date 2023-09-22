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
}

export const changeCount = (
  product: IUpdateItem,
  cart: OrderItem[]
): OrderItem[] => {
  const { _id, count, isTake } = product

  if (typeof isTake !== "undefined") {
    return cart.map((item) => (item._id === _id ? { ...item, isTake } : item))
  }

  if (typeof count !== "undefined") {
    const newCart = cart.map((item) =>
      item._id === _id ? { ...item, count } : item
    )

    if (count === -1) {
      return newCart.filter((item) => item._id !== _id)
    }

    return newCart
  }

  return cart
}

export const addToCart = (
  product: IProduct,
  cart: OrderItem[]
): OrderItem[] => {
  const prevItem = cart.find(
    ({ productId, status, manufacturedDate, isTake }) =>
      productId === product._id &&
      status === ORDER_STATUSES.NEW &&
      manufacturedDate == product.manufacturedDate &&
      !isTake
  )

  if (prevItem) {
    const { _id, count } = prevItem
    return changeCount({ _id, count: count + 1 }, cart)
  }

  const { unitPrice, _id, name } = product

  const cartItem = {
    _id: Math.random().toString(),
    productId: _id,
    count: 1,
    unitPrice,
    productName: name,
    status: ORDER_STATUSES.NEW as IOrderItemStatus,
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
    }) => ({
      _id,
      productId,
      count,
      unitPrice,
      isPackage,
      isTake,
      status,
      manufacturedDate,
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
    set(cartAtom, changeCount(update, get(cartAtom)))
  }
)
export const setCartAtom = atom(
  () => "",
  (get, set, update: OrderItem[]) => {
    set(cartAtom, update)
  }
)
