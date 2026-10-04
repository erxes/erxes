"use client"

import { useState } from "react"
import authQueries from "@/modules/auth/graphql/queries"
import { isAdminAtom } from "@/store/config.store"
import { useQuery } from "@apollo/client"
import { format } from "date-fns"
import { useAtomValue } from "jotai"
import {
  ChevronLeft,
  ChevronRight,
  HistoryIcon,
  RefreshCw,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import HeaderLayout from "@/components/header/headerLayout"

import {
  getOrderAuditUserLabel,
  isCartLogItem,
  isItemAction,
  OrderAuditLog,
  orderAuditLogs,
} from "../graphql/orderAudit"

const valueText = (value: unknown): string =>
  value == null
    ? "-"
    : typeof value === "object"
    ? JSON.stringify(value)
    : String(value)

export const AuditItemSnapshot = ({ value }: { value: unknown }) => {
  const items = Array.isArray(value) ? value.filter(isCartLogItem) : []
  return (
    <div className="space-y-1 min-w-0">
      {!items.length && <span className="text-muted-foreground">Бараагүй</span>}
      {items.map((item) => (
        <div key={item._id} className="text-xs break-words">
          <span className="font-medium">
            {item.productName || item.productId}
          </span>
          <span>
            {" "}
            · {item.count} × {item.unitPrice}
          </span>
          {!!item.discountAmount && (
            <span> · Хөнгөлөлт: {item.discountAmount}</span>
          )}
          {item.description && <span> · {item.description}</span>}
          {item.status && <span> · {item.status}</span>}
        </div>
      ))}
    </div>
  )
}

export const OrderAuditPage = () => {
  const isAdmin = useAtomValue(isAdminAtom)
  const [userId, setUserId] = useState("all")
  const [orderSearch, setOrderSearch] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [source, setSource] = useState("all")
  const [startDate, setStartDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  )
  const [endDate, setEndDate] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [page, setPage] = useState(1)
  const invalidRange = !!startDate && !!endDate && startDate > endDate
  const { data, loading, error, refetch } = useQuery<{
    orderChangeLogs: OrderAuditLog[]
  }>(orderAuditLogs, {
    skip: !isAdmin || invalidRange,
    variables: {
      orderNumber: orderNumber || undefined,
      source: source === "all" ? undefined : source,
      userId: userId === "all" ? undefined : userId,
      startDate: startDate
        ? new Date(`${startDate}T00:00:00`).toISOString()
        : undefined,
      endDate: endDate
        ? new Date(`${endDate}T23:59:59.999`).toISOString()
        : undefined,
      page,
      perPage: 50,
    },
    fetchPolicy: "network-only",
    pollInterval: 10000,
  })
  const users = useQuery<{
    posUsers: {
      _id: string
      email?: string
      firstName?: string
      lastName?: string
    }[]
  }>(authQueries.posUsers, { skip: !isAdmin })
  const logs = data?.orderChangeLogs || []
  const groups = new Map<string, { day: string; entries: OrderAuditLog[] }>()
  for (const log of logs) {
    const date = new Date(log.occurredAt || log.createdAt || "")
    const day = Number.isFinite(date.valueOf())
      ? format(date, "yyyy-MM-dd")
      : "-"
    const key = `${day}:${log.userId || "-"}`
    const group = groups.get(key) || { day, entries: [] }
    group.entries.push(log)
    groups.set(key, group)
  }

  if (!isAdmin) return <div className="p-6">Хандах эрхгүй</div>

  return (
    <>
      <HeaderLayout>
        <span className="inline-flex items-center gap-1 text-sm font-semibold">
          <HistoryIcon size={18} />
          Өөрчлөлтийн лог
        </span>
      </HeaderLayout>
      <main className="flex-1 overflow-auto p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              setOrderNumber(orderSearch.trim())
              setPage(1)
            }}
          >
            <div className="w-60 max-w-full space-y-1">
              <Label htmlFor="logOrderNumber">Захиалгын дугаар</Label>
              <Input
                id="logOrderNumber"
                type="search"
                value={orderSearch}
                onChange={(event) => {
                  setOrderSearch(event.target.value)
                  if (!event.target.value.trim()) {
                    setOrderNumber("")
                    setPage(1)
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              size="icon"
              title="Захиалгаар хайх"
              disabled={invalidRange}
            >
              <Search size={16} />
            </Button>
          </form>
          <div className="w-60 max-w-full space-y-1">
            <Label htmlFor="logSource">Эх үүсвэр</Label>
            <Select
              value={source}
              onValueChange={(value) => {
                setSource(value)
                setPage(1)
              }}
            >
              <SelectTrigger id="logSource">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх эх үүсвэр</SelectItem>
                <SelectItem value="cart">Сагсны өөрчлөлт</SelectItem>
                <SelectItem value="order">Захиалгын өөрчлөлт</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-60 space-y-1">
            <Label>Хэрэглэгч</Label>
            <Select
              value={userId}
              onValueChange={(value) => {
                setUserId(value)
                setPage(1)
              }}
            >
              <SelectTrigger loading={users.loading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх хэрэглэгч</SelectItem>
                {(users.data?.posUsers || []).map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.email ||
                      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                      user._id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="logStartDate">Эхлэх огноо</Label>
            <Input
              id="logStartDate"
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="logEndDate">Дуусах огноо</Label>
            <Input
              id="logEndDate"
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value)
                setPage(1)
              }}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            title="Шинэчлэх"
            disabled={loading || invalidRange}
            onClick={() => void refetch()}
          >
            <RefreshCw size={16} />
          </Button>
        </div>
        {invalidRange && (
          <p role="alert" className="text-destructive">
            Огнооны хязгаар буруу байна.
          </p>
        )}
        {error && (
          <p role="alert" className="text-destructive">
            {error.message}
          </p>
        )}
        {users.error && (
          <p role="alert" className="text-destructive">
            {users.error.message}
          </p>
        )}
        {loading && <p role="status">Уншиж байна...</p>}
        {!loading && !error && !invalidRange && !logs.length && (
          <p className="text-muted-foreground">Өөрчлөлтийн лог байхгүй.</p>
        )}
        {!invalidRange &&
          Array.from(groups).map(([group, { day, entries }]) => (
            <section key={group}>
              <h2 className="text-sm text-muted-foreground border-b py-2 break-words">
                {day} · {getOrderAuditUserLabel(entries[0])}
              </h2>
              {entries.map((log) => {
                const actions = log.changes.find(
                  (change) => change.field === "itemActions"
                )?.newValue
                const items = log.changes.find(
                  (change) => change.field === "items"
                )
                const date = new Date(log.occurredAt || log.createdAt || "")
                return (
                  <div key={log._id} className="border-b py-3 space-y-2">
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span
                        className="break-words max-w-full"
                        title={log.userId}
                      >
                        Хэрэглэгч: {getOrderAuditUserLabel(log)}
                      </span>
                      <time>
                        {Number.isFinite(date.valueOf())
                          ? format(date, "HH:mm:ss")
                          : "-"}
                      </time>
                      <span>
                        {log.orderId
                          ? `Захиалга: ${log.orderId}`
                          : `Сагс: ${log.cartId || "-"}`}
                      </span>
                      <span>
                        {log.source === "cart"
                          ? "Сагсны өөрчлөлт"
                          : "Захиалгын өөрчлөлт"}
                      </span>
                    </div>
                    {Array.isArray(actions) &&
                      actions.filter(isItemAction).map((action) => (
                        <div
                          key={action.itemId}
                          className="text-sm break-words"
                        >
                          <strong>
                            {action.productName || action.productId}
                          </strong>{" "}
                          ·{" "}
                          {action.action === "removed"
                            ? "Устгасан"
                            : "Тоо бууруулсан"}
                          : {action.beforeCount} → {action.afterCount}
                        </div>
                      ))}
                    {items && (
                      <details>
                        <summary className="cursor-pointer text-sm">
                          Барааны өмнөх / дараах жагсаалт
                        </summary>
                        <div className="grid sm:grid-cols-2 gap-3 mt-2">
                          <div>
                            <h3 className="text-xs font-semibold mb-1">Өмнө</h3>
                            <AuditItemSnapshot value={items.oldValue} />
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold mb-1">
                              Дараа
                            </h3>
                            <AuditItemSnapshot value={items.newValue} />
                          </div>
                        </div>
                      </details>
                    )}
                    {log.changes
                      .filter(
                        (change) =>
                          !["items", "itemActions"].includes(change.field)
                      )
                      .map((change) => (
                        <div key={change.field} className="text-xs break-words">
                          {change.field}: {valueText(change.oldValue)} →{" "}
                          {valueText(change.newValue)}
                        </div>
                      ))}
                  </div>
                )
              })}
            </section>
          ))}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            title="Өмнөх хуудас"
            disabled={page <= 1 || loading}
            onClick={() => setPage((value) => value - 1)}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm">{page}</span>
          <Button
            variant="outline"
            size="icon"
            title="Дараах хуудас"
            disabled={logs.length < 50 || loading || invalidRange}
            onClick={() => setPage((value) => value + 1)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </main>
    </>
  )
}
