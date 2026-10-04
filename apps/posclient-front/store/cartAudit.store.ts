import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { OrderItem } from "@/types/order.types"

import { configAtom, currentUserAtom } from "./config.store"

export type CartLogItem = Pick<
  OrderItem,
  | "_id"
  | "productId"
  | "productName"
  | "count"
  | "unitPrice"
  | "discountAmount"
  | "discountPercent"
  | "status"
  | "description"
  | "discountInfos"
  | "isTake"
  | "isPackage"
  | "manufacturedDate"
  | "attachment"
  | "productImgUrl"
  | "categoryId"
>

export type CartAuditEvent = {
  eventId: string
  cartId: string
  orderId?: string
  actorId: string
  posToken: string
  occurredAt: string
  beforeItems: CartLogItem[]
  afterItems: CartLogItem[]
}

const createId = (): string =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`

const snapshotItems = (items: OrderItem[]): CartLogItem[] =>
  items.map((item) => ({
    _id: item._id,
    productId: item.productId,
    productName: item.productName,
    count: item.count,
    unitPrice: item.unitPrice,
    discountAmount: item.discountAmount,
    discountPercent: item.discountPercent,
    status: item.status,
    description: item.description,
    discountInfos: item.discountInfos?.map((info) => ({ ...info })),
    isTake: item.isTake,
    isPackage: item.isPackage,
    manufacturedDate: item.manufacturedDate,
    attachment: item.attachment ? { ...item.attachment } : item.attachment,
    productImgUrl: item.productImgUrl,
    categoryId: item.categoryId,
  }))

export const draftCartIdAtom = atomWithStorage<string | null>(
  "posDraftCartId",
  null,
  undefined,
  { getOnInit: true }
)
export const cartAuditQueueAtom = atomWithStorage<CartAuditEvent[]>(
  "posCartAuditQueue",
  [],
  undefined,
  { getOnInit: true }
)

export const recordCartAuditAtom = atom(
  null,
  (
    get,
    set,
    change: {
      orderId?: string | null
      beforeItems: OrderItem[]
      afterItems: OrderItem[]
    }
  ) => {
    const hasReduction = change.beforeItems.some((item) => {
      const after = change.afterItems.find((next) => next._id === item._id)
      return !after || after.count < item.count
    })
    if (!hasReduction) return
    const userId = get(currentUserAtom)?._id
    const token = get(configAtom)?.token
    if (!userId || !token) return

    const draftId = get(draftCartIdAtom) || createId()
    set(draftCartIdAtom, draftId)
    const cartId = change.orderId ? `order:${change.orderId}` : draftId
    const event: CartAuditEvent = {
      eventId: createId(),
      cartId,
      orderId: change.orderId || undefined,
      actorId: userId,
      posToken: token,
      occurredAt: new Date().toISOString(),
      beforeItems: snapshotItems(change.beforeItems),
      afterItems: snapshotItems(change.afterItems),
    }
    // Persist the event before changing the cart; failed sends stay in this outbox.
    set(cartAuditQueueAtom, [...get(cartAuditQueueAtom), event])
  }
)
