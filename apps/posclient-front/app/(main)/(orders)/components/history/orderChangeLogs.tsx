import { format } from "date-fns"
import { ArrowRightIcon, HistoryIcon } from "lucide-react"

import { BILL_TYPES, typeTextDef } from "@/lib/constants"
import { cn } from "@/lib/utils"

export type OrderChangeEntry = {
  field: string
  oldValue?: unknown
  newValue?: unknown
}

export type OrderChangeLog = {
  _id: string
  createdAt?: string
  changes?: OrderChangeEntry[]
  user?: {
    email?: string
    primaryEmail?: string
  }
}

type SnapshotItem = {
  _id?: string
  productId?: string
  productName?: string
  count?: number
  unitPrice?: number
  isTake?: boolean
  status?: string
}

type ItemAction = {
  itemId?: string
  productId?: string
  productName?: string
  action?: "decreased" | "removed"
  beforeCount?: number
  afterCount?: number
}

type Line = {
  key: string
  label: string
  before?: string
  after?: string
  tone?: "added" | "removed"
}

const FIELD_LABELS: Record<string, string> = {
  items: "Бараа",
  itemActions: "Бараа",
  status: "Төлөв",
  saleStatus: "Борлуулалтын төлөв",
  totalAmount: "Нийт дүн",
  directDiscount: "Хөнгөлөлт",
  directIsAmount: "Хөнгөлөлт дүнгээр",
  customerId: "Харилцагч",
  customerType: "Харилцагчийн төрөл",
  brokerId: "Зуучлагч",
  brokerType: "Зуучлагчийн төрөл",
  type: "Захиалгын төрөл",
  billType: "Баримтын төрөл",
  registerNumber: "Регистрийн дугаар",
  slotCode: "Ширээ",
  subBranchId: "Дэд салбар",
  departmentId: "Хэлтэс",
  taxInfo: "Татварын мэдээлэл",
  extraInfo: "Нэмэлт мэдээлэл",
  dueDate: "Дуусах огноо",
  branchId: "Салбар",
  deliveryInfo: "Хүргэлтийн мэдээлэл",
  description: "Тайлбар",
}

const NESTED_LABELS: Record<string, string> = {
  rawTotalAmount: "Хөнгөлөлтгүй дүн",
  couponCode: "Купон",
  voucherId: "Ваучер",
}

const AMOUNT_FIELDS = ["totalAmount", "rawTotalAmount", "directDiscount"]

const CUSTOMER_TYPES: Record<string, string> = {
  customer: "Хэрэглэгч",
  user: "Ажилтан",
  company: "Байгууллага",
}

const BILL_TYPE_LABELS: Record<string, string> = {
  [BILL_TYPES.CITIZEN]: "Иргэн",
  [BILL_TYPES.ENTITY]: "Байгууллага",
  [BILL_TYPES.INNER]: "Дотоод",
}

const isEmpty = (value: unknown) =>
  value === null || value === undefined || value === ""

const formatValue = (field: string, value: unknown): string => {
  if (isEmpty(value)) return "—"
  if (typeof value === "boolean") return value ? "Тийм" : "Үгүй"
  if (typeof value === "number")
    return AMOUNT_FIELDS.includes(field)
      ? `${value.toLocaleString()}₮`
      : value.toLocaleString()
  if (typeof value === "string") {
    if (field === "type") return typeTextDef[value] || value
    if (field === "customerType") return CUSTOMER_TYPES[value] || value
    if (field === "billType") return BILL_TYPE_LABELS[value] || value
    if (field === "dueDate" && !Number.isNaN(Date.parse(value)))
      return format(new Date(value), "yyyy.MM.dd HH:mm")
    return value
  }
  return JSON.stringify(value)
}

const asArray = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : []

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const itemLines = (
  change: OrderChangeEntry,
  nameOf: (item: SnapshotItem) => string
): Line[] => {
  const before = asArray<SnapshotItem>(change.oldValue)
  const after = asArray<SnapshotItem>(change.newValue)
  const lines: Line[] = []

  after.forEach((item) => {
    const prev = before.find((old) => old._id === item._id)
    const name = nameOf(item)
    if (!prev) {
      lines.push({
        key: `add-${item._id}`,
        label: name,
        after: `${item.count ?? 0} ширхэг нэмсэн`,
        tone: "added",
      })
      return
    }
    if (prev.count !== item.count)
      lines.push({
        key: `count-${item._id}`,
        label: name,
        before: `${prev.count ?? 0} ширхэг`,
        after: `${item.count ?? 0} ширхэг`,
      })
    if (prev.unitPrice !== item.unitPrice)
      lines.push({
        key: `price-${item._id}`,
        label: `${name} · үнэ`,
        before: formatValue("totalAmount", prev.unitPrice),
        after: formatValue("totalAmount", item.unitPrice),
      })
    if (!!prev.isTake !== !!item.isTake)
      lines.push({
        key: `take-${item._id}`,
        label: name,
        before: prev.isTake ? "Авч явах" : "Зааланд",
        after: item.isTake ? "Авч явах" : "Зааланд",
      })
    if (prev.status !== item.status)
      lines.push({
        key: `status-${item._id}`,
        label: `${name} · төлөв`,
        before: formatValue("status", prev.status),
        after: formatValue("status", item.status),
      })
  })

  before
    .filter((old) => !after.some((item) => item._id === old._id))
    .forEach((old) =>
      lines.push({
        key: `remove-${old._id}`,
        label: nameOf(old),
        after: `${old.count ?? 0} ширхэг хассан`,
        tone: "removed",
      })
    )

  return lines
}

const itemActionLines = (
  change: OrderChangeEntry,
  nameOf: (item: SnapshotItem) => string
): Line[] =>
  asArray<ItemAction>(change.newValue).map((action, index) => ({
    key: `action-${action.itemId || index}`,
    label: nameOf(action),
    before:
      action.action === "removed"
        ? undefined
        : `${action.beforeCount ?? 0} ширхэг`,
    after:
      action.action === "removed"
        ? `${action.beforeCount ?? 0} ширхэг хассан`
        : `${action.afterCount ?? 0} ширхэг`,
    tone: action.action === "removed" ? "removed" : undefined,
  }))

const nestedLines = (change: OrderChangeEntry): Line[] => {
  const before = asRecord(change.oldValue)
  const after = asRecord(change.newValue)
  const keys = Array.from(
    new Set([...Object.keys(before), ...Object.keys(after)])
  )

  return keys
    .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
    .map((key) => ({
      key: `${change.field}-${key}`,
      label: NESTED_LABELS[key] || key,
      before: formatValue(key, before[key]),
      after: formatValue(key, after[key]),
    }))
}

const changeLines = (
  log: OrderChangeLog,
  nameOf: (item: SnapshotItem) => string
): Line[] => {
  const changes = log.changes || []
  const hasItems = changes.some((change) => change.field === "items")

  return (
    changes
      .flatMap((change) => {
        if (change.field === "items") return itemLines(change, nameOf)
        if (change.field === "itemActions")
          return hasItems ? [] : itemActionLines(change, nameOf)

        const label = FIELD_LABELS[change.field] || change.field
        const isObject = (value: unknown) =>
          !!value && typeof value === "object" && !Array.isArray(value)

        if (isObject(change.oldValue) || isObject(change.newValue))
          return nestedLines(change).map((line) => ({
            ...line,
            label: `${label} · ${line.label}`,
          }))

        return [
          {
            key: change.field,
            label,
            before: formatValue(change.field, change.oldValue),
            after: formatValue(change.field, change.newValue),
          },
        ]
      })
      .filter((line) => line.before !== line.after)
      .map((line) =>
        line.before === "—" ? { ...line, before: undefined } : line
      )
  )
}

const OrderChangeLogs = ({
  logs,
  items,
}: {
  logs: OrderChangeLog[]
  items?: SnapshotItem[]
}) => {
  if (!logs.length)
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <HistoryIcon className="h-8 w-8" strokeWidth={1.5} />
        <span className="text-xs font-medium">Өөрчлөлт бүртгэгдээгүй</span>
      </div>
    )

  const nameOf = (item: SnapshotItem) =>
    item.productName ||
    (items || []).find((orderItem) => orderItem.productId === item.productId)
      ?.productName ||
    item.productId ||
    "Бараа"

  return (
    <div className="px-1 py-2">
      <ol className="relative space-y-5 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-border">
        {logs.map((log) => {
          const lines = changeLines(log, nameOf)
          const author = log.user?.primaryEmail || log.user?.email

          return (
            <li key={log._id} className="relative pl-6">
              <span className="absolute left-0 top-1 h-[11px] w-[11px] rounded-full border-2 border-background bg-primary ring-1 ring-primary/30" />
              <div className="mb-2 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <span className="font-medium tabular-nums text-foreground">
                  {log.createdAt
                    ? format(new Date(log.createdAt), "yyyy.MM.dd HH:mm")
                    : ""}
                </span>
                {author && <span>· {author}</span>}
              </div>
              {lines.length ? (
                <div className="divide-y rounded-lg border bg-background">
                  {lines.map((line) => (
                    <ChangeLine key={line.key} line={line} />
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Харагдах өөрчлөлт алга
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const ChangeLine = ({ line }: { line: Line }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-[13px]">
    <span className="min-w-0 flex-1 truncate text-muted-foreground">
      {line.label}
    </span>
    <span className="flex items-center gap-1.5 font-medium">
      {line.before !== undefined && (
        <>
          <span className="text-muted-foreground line-through decoration-muted-foreground/50">
            {line.before}
          </span>
          <ArrowRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </>
      )}
      <span
        className={cn(
          line.tone === "added" &&
            "rounded bg-success/10 px-1.5 py-0.5 text-success",
          line.tone === "removed" &&
            "rounded bg-destructive/10 px-1.5 py-0.5 text-destructive"
        )}
      >
        {line.after}
      </span>
    </span>
  </div>
)

export default OrderChangeLogs
