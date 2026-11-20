import { paymentTypesAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"
import {
  BanknoteIcon,
  CreditCardIcon,
  FolderIcon,
  HandCoinsIcon,
  HashIcon,
  LayersIcon,
  LucideIcon,
  PackageIcon,
  ReceiptTextIcon,
  SmartphoneIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

type Amounts = Record<string, number | string | undefined>

type ReportProduct = {
  name?: string | null
  code?: string | null
  unitPrice?: number
  count?: number
}

type ReportCategory = {
  code?: string | null
  name?: string | null
  products: ReportProduct[] | Record<string, ReportProduct>
}

type ReportUser = {
  user?: {
    _id?: string
    email?: string
    details?: { fullName?: string }
  }
  ordersAmounts?: Amounts
  items?: Record<string, ReportCategory>
}

export type DailyReport = Record<string, ReportUser>

const BASE_PAYMENTS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "cashAmount", label: "Бэлнээр", icon: BanknoteIcon },
  { key: "mobileAmount", label: "Цахимаар", icon: SmartphoneIcon },
  { key: "cardAmount", label: "Картаар", icon: CreditCardIcon },
  { key: "receivableAmount", label: "Авлага", icon: HandCoinsIcon },
]

const NON_PAYMENT_KEYS = ["_id", "count", "totalAmount"]
const UNKNOWN_CATEGORY = "Unknown"

const toNumber = (value: unknown) => (typeof value === "number" ? value : 0)

const formatNum = (value: number) => `${Math.round(value).toLocaleString()}₮`

const percent = (part: number, whole: number) =>
  whole ? Math.min((part / whole) * 100, 100) : 0

const initials = (text: string) =>
  text
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "?"

const sumAmounts = (users: ReportUser[]) =>
  users.reduce<Record<string, number>>((acc, { ordersAmounts }) => {
    Object.entries(ordersAmounts || {}).forEach(([key, value]) => {
      acc[key] = (acc[key] || 0) + toNumber(value)
    })
    return acc
  }, {})

const collectProducts = (users: ReportUser[]) => {
  const byKey: Record<
    string,
    { name: string; category: string; count: number; amount: number }
  > = {}

  users.forEach(({ items }) =>
    Object.values(items || {}).forEach((category) =>
      Object.values(category.products || {}).forEach((product) => {
        const key = product.code || product.name || "unknown"
        const count = product.count || 0
        const entry = (byKey[key] = byKey[key] || {
          name: product.name || product.code || "Бараа",
          category:
            category.name && category.name !== UNKNOWN_CATEGORY
              ? category.name
              : "",
          count: 0,
          amount: 0,
        })
        entry.count += count
        entry.amount += (product.unitPrice || 0) * count
      })
    )
  )

  return Object.values(byKey).sort((a, b) => b.amount - a.amount)
}

const ReportSummary = ({ report }: { report: DailyReport }) => {
  const paymentTypes = useAtomValue(paymentTypesAtom)
  const users = Object.values(report || {})

  if (!users.length)
    return (
      <div className="flex flex-col items-center rounded-lg border px-6 py-16 text-center">
        <ReceiptTextIcon
          className="mb-4 h-10 w-10 text-muted-foreground/60"
          strokeWidth={1.5}
        />
        <h3 className="text-sm font-semibold">Захиалга олдсонгүй</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Сонгосон хугацаанд гүйлгээ хийгдээгүй байна
        </p>
      </div>
    )

  const totals = sumAmounts(users)
  const total = totals.totalAmount || 0
  const count = totals.count || 0
  const products = collectProducts(users)
  const productCount = products.reduce((sum, p) => sum + p.count, 0)
  const baseKeys = BASE_PAYMENTS.map(({ key }) => key)

  const payments = [
    ...BASE_PAYMENTS,
    ...Object.keys(totals)
      .filter(
        (key) => !NON_PAYMENT_KEYS.includes(key) && !baseKeys.includes(key)
      )
      .map((key) => ({
        key,
        label:
          (paymentTypes || []).find((type) => type.type === key)?.title || key,
        icon: WalletIcon,
      })),
  ]
    .filter(
      ({ key }) =>
        key === "cashAmount" || key === "mobileAmount" || !!totals[key]
    )
    .map((payment) => ({ ...payment, amount: totals[payment.key] || 0 }))
    .sort((a, b) => b.amount - a.amount)

  const topPayment = payments[0]

  const sortedUsers = [...users]
    .map(({ user, ordersAmounts }) => ({
      id: user?._id,
      name: user?.details?.fullName || user?.email || "Ажилтангүй захиалга",
      amount: toNumber(ordersAmounts?.totalAmount),
      count: toNumber(ordersAmounts?.count),
    }))
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={TrendingUpIcon}
          label="Нийт борлуулалт"
          value={formatNum(total)}
          hint={`${users.length} ажилтан`}
          primary
        />
        <StatCard
          icon={ReceiptTextIcon}
          label="Баримтын тоо"
          value={count.toLocaleString()}
          hint="Төлөгдсөн баримт"
        />
        <StatCard
          icon={WalletIcon}
          label="Дундаж баримт"
          value={formatNum(count ? total / count : 0)}
          hint={
            topPayment
              ? `${topPayment.label} · ${percent(topPayment.amount, total).toFixed(0)}%`
              : ""
          }
        />
        <StatCard
          icon={PackageIcon}
          label="Борлуулсан бараа"
          value={`${productCount.toLocaleString()} ш`}
          hint={`${products.length} төрөл`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Block title="Төлбөрийн хэлбэр">
          {payments.map(({ key, label, icon: Icon, amount }) => (
            <BarRow
              key={key}
              lead={
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              }
              label={label}
              value={formatNum(amount)}
              meta={`${percent(amount, total).toFixed(0)}%`}
              share={percent(amount, total)}
            />
          ))}
        </Block>

        <Block title="Ажилчдаар">
          {sortedUsers.map(({ id, name, amount, count }, index) => (
            <BarRow
              key={id || index}
              rank={index + 1}
              lead={
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                  {initials(name)}
                </div>
              }
              label={name}
              value={formatNum(amount)}
              meta={`${count.toLocaleString()} баримт`}
              share={percent(amount, sortedUsers[0]?.amount || 0)}
            />
          ))}
        </Block>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold">Борлуулсан бараа</h3>
          <span className="text-xs text-muted-foreground">
            {products.length} бичлэг олдлоо
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border-l-4 border-t-4 border-sidebar bg-sidebar">
          <div className="overflow-x-auto pb-1 pr-1">
            <table className="w-full table-fixed border-separate border-spacing-0 text-[13px] leading-none">
              <thead>
                <tr>
                  <Th icon={HashIcon} className="w-14" />
                  <Th icon={PackageIcon} label="Бараа" />
                  <Th
                    icon={FolderIcon}
                    label="Ангилал"
                    className="hidden w-44 md:table-cell"
                  />
                  <Th icon={LayersIcon} label="Тоо" className="w-24" />
                  <Th icon={WalletIcon} label="Дүн" className="w-40" />
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr
                    key={`${product.category}-${product.name}`}
                    className="group/row"
                  >
                    <td className={cn(cellClass, "text-muted-foreground")}>
                      {index + 1}
                    </td>
                    <td className={cn(cellClass, "font-medium")}>
                      <span className="block truncate">{product.name}</span>
                    </td>
                    <td className={cn(cellClass, "hidden md:table-cell")}>
                      {product.category ? (
                        <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {product.category}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className={cn(cellClass, "font-medium tabular-nums")}>
                      {product.count.toLocaleString()}
                    </td>
                    <td className={cn(cellClass, "font-semibold tabular-nums")}>
                      {formatNum(product.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const cellClass =
  "h-cell overflow-hidden whitespace-nowrap border-b border-r bg-background px-2 align-middle transition-colors group-hover/row:bg-muted first:border-l [tr:first-child>&]:border-t [tr:first-child>&:first-child]:rounded-tl-lg [tr:first-child>&:last-child]:rounded-tr-lg"

const Th = ({
  icon: Icon,
  label,
  className,
}: {
  icon: LucideIcon
  label?: string
  className?: string
}) => (
  <th
    className={cn(
      "h-9 whitespace-nowrap bg-sidebar px-2 text-left align-middle font-mono text-xs font-semibold uppercase text-muted-foreground/80",
      className
    )}
  >
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 flex-none" />
      {label}
    </span>
  </th>
)

const StatCard = ({
  icon: Icon,
  label,
  value,
  hint,
  primary,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  primary?: boolean
}) => (
  <div className="flex items-start justify-between gap-2 rounded-lg border bg-background p-4">
    <div className="min-w-0">
      <div className="truncate font-mono text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1.5 truncate text-base font-semibold tabular-nums",
          primary && "text-primary"
        )}
      >
        {value}
      </div>
      {!!hint && (
        <div className="mt-0.5 truncate text-xs text-muted-foreground">
          {hint}
        </div>
      )}
    </div>
    <div
      className={cn(
        "flex h-8 w-8 flex-none items-center justify-center rounded-md bg-muted text-muted-foreground",
        primary && "bg-primary/10 text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
    </div>
  </div>
)

const Block = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="min-w-0">
    <h3 className="mb-2 text-sm font-semibold">{title}</h3>
    <div className="divide-y overflow-hidden rounded-lg border">{children}</div>
  </div>
)

const BarRow = ({
  rank,
  lead,
  label,
  value,
  meta,
  share,
}: {
  rank?: number
  lead: React.ReactNode
  label: string
  value: string
  meta: string
  share: number
}) => (
  <div className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50">
    {rank !== undefined && (
      <span className="w-4 flex-none text-right text-xs tabular-nums text-muted-foreground">
        {rank}
      </span>
    )}
    <div className="flex-none">{lead}</div>
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-[13px] font-medium">{label}</span>
        <span className="flex-none text-[13px] font-semibold tabular-nums">
          {value}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${share}%` }}
          />
        </div>
        <span className="flex-none text-[11px] tabular-nums text-muted-foreground">
          {meta}
        </span>
      </div>
    </div>
  </div>
)

export default ReportSummary
