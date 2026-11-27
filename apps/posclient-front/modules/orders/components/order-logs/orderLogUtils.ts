import { BadgeProps } from "@/components/ui/badge"

import { OrderAuditLog } from "../../graphql/orderAudit"

export const ORDER_LOG_SOURCES: Record<
  string,
  { label: string; variant: BadgeProps["variant"] }
> = {
  order: { label: "Захиалга", variant: "info" },
  cart: { label: "Сагс", variant: "secondary" },
  cover: { label: "Хаалт", variant: "warning" },
}

export const ORDER_LOG_ACTIONS: Record<
  NonNullable<OrderAuditLog["action"]>,
  { label: string; variant: BadgeProps["variant"] }
> = {
  create: { label: "Үүсгэсэн", variant: "success" },
  update: { label: "Өөрчилсөн", variant: "info" },
  cancel: { label: "Цуцалсан", variant: "destructive" },
  return: { label: "Буцаалт", variant: "warning" },
  delete: { label: "Устгасан", variant: "destructive" },
}

export const sourceOf = (log: OrderAuditLog) =>
  ORDER_LOG_SOURCES[log.source || "order"] || ORDER_LOG_SOURCES.order

export const logDate = (log: OrderAuditLog) => {
  const date = new Date(log.occurredAt || log.createdAt || "")
  return Number.isFinite(date.valueOf()) ? date : null
}

export const logTarget = (log: OrderAuditLog) => {
  if (log.coverId) return "Хаалт"
  if (log.orderId) return log.orderNumber || "Захиалга"
  return "Сагс"
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value)

export const isEmptyValue = (value: unknown): boolean => {
  if (value == null || value === "") return true
  if (Array.isArray(value)) return !value.length
  if (isPlainObject(value)) return Object.values(value).every(isEmptyValue)
  return false
}

export const valueText = (value: unknown): string => {
  if (isEmptyValue(value)) return "—"
  if (typeof value === "boolean") return value ? "Тийм" : "Үгүй"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export const objectEntries = (value: unknown): [string, unknown][] | null =>
  isPlainObject(value)
    ? Object.entries(value).filter(([, entry]) => !isEmptyValue(entry))
    : null

const snapshotFields = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? { ...value }
    : {}

export const fieldChanges = (log: OrderAuditLog) =>
  log.changes
    .filter((change) => !["items", "itemActions"].includes(change.field))
    .flatMap((change) => {
      if (!["order", "cover"].includes(change.field)) return [change]
      const before = snapshotFields(change.oldValue)
      const after = snapshotFields(change.newValue)
      return Array.from(
        new Set([...Object.keys(before), ...Object.keys(after)])
      )
        .filter((field) => field !== "items")
        .map((field) => ({
          field,
          oldValue: before[field],
          newValue: after[field],
        }))
    })
    .filter(
      (change) =>
        !(isEmptyValue(change.oldValue) && isEmptyValue(change.newValue)) &&
        valueText(change.oldValue) !== valueText(change.newValue)
    )

export const itemChanges = (log: OrderAuditLog) => {
  const items = log.changes.find((change) => change.field === "items")
  const actions = log.changes.find(
    (change) => change.field === "itemActions"
  )?.newValue

  return {
    items,
    actions: Array.isArray(actions) ? actions : [],
    beforeCount: Array.isArray(items?.oldValue) ? items.oldValue.length : 0,
    afterCount: Array.isArray(items?.newValue) ? items.newValue.length : 0,
  }
}

export const changeSummary = (log: OrderAuditLog) => {
  const total = fieldChanges(log).find(
    (change) => change.field === "totalAmount"
  )
  const { items, beforeCount, afterCount } = itemChanges(log)
  const parts: string[] = []
  if (total) {
    parts.push(
      isEmptyValue(total.oldValue)
        ? `Дүн ${valueText(total.newValue)}`
        : `Дүн ${valueText(total.oldValue)} → ${valueText(total.newValue)}`
    )
  }
  if (items) parts.push(`Бараа ${beforeCount} → ${afterCount}`)
  return parts.join(" · ")
}
