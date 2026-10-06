import { CartLogItem } from "@/store/cartAudit.store"
import { gql } from "@apollo/client"

export type OrderAuditLog = {
  _id: string
  orderId?: string
  cartId?: string
  source?: string
  action?: "create" | "update" | "cancel" | "return" | null
  userId?: string
  occurredAt?: string
  createdAt?: string
  user?: {
    email?: string
    primaryEmail?: string
    firstName?: string
    lastName?: string
    username?: string
    details?: { fullName?: string }
  }
  changes: { field: string; oldValue?: unknown; newValue?: unknown }[]
}

export const getOrderAuditUserLabel = (log: OrderAuditLog): string => {
  const user = log.user
  return (
    user?.details?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username?.trim() ||
    user?.primaryEmail ||
    user?.email ||
    log.userId ||
    "Тодорхойгүй хэрэглэгч"
  )
}

export type ItemAction = {
  itemId: string
  productId: string
  productName?: string
  action: string
  beforeCount: number
  afterCount: number
}

export const isCartLogItem = (value: unknown): value is CartLogItem =>
  !!value &&
  typeof value === "object" &&
  "productId" in value &&
  "count" in value &&
  typeof value.productId === "string" &&
  typeof value.count === "number"

export const isItemAction = (value: unknown): value is ItemAction =>
  !!value &&
  typeof value === "object" &&
  "action" in value &&
  "productId" in value &&
  "beforeCount" in value &&
  "afterCount" in value &&
  typeof value.productId === "string" &&
  typeof value.beforeCount === "number" &&
  typeof value.afterCount === "number"

export const orderAuditLogs = gql`
  query posclientOrderAuditLogs(
    $orderNumber: String
    $source: String
    $userId: String
    $startDate: Date
    $endDate: Date
    $page: Int
    $perPage: Int
  ) {
    orderChangeLogs(
      orderNumber: $orderNumber
      source: $source
      userId: $userId
      startDate: $startDate
      endDate: $endDate
      page: $page
      perPage: $perPage
    ) {
      _id
      orderId
      cartId
      source
      action
      userId
      occurredAt
      createdAt
      user {
        email
        primaryEmail
        firstName
        lastName
        username
        details {
          fullName
        }
      }
      changes {
        field
        oldValue
        newValue
      }
    }
  }
`
