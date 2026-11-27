import {
  qzMainPrinterAtom,
  qzTrayEnabledAtom,
  reportEndDateAtom,
  reportStartDateAtom,
} from "@/store"
import { configAtom, paymentTypesAtom } from "@/store/config.store"
import { format } from "date-fns"
import { useAtomValue } from "jotai"
import { PrinterIcon } from "lucide-react"

import { IPaymentType } from "@/types/config.types"
import { captureDocumentHtml } from "@/lib/captureHtml"
import {
  ensureQzConnected,
  printHtmlToPrinter,
  QZ_TRAY_NOT_RUNNING_MESSAGE,
} from "@/lib/qzTray"
import { Button } from "@/components/ui/button"
import { onError } from "@/components/ui/use-toast"
import PrintLayout from "@/app/reciept/layout"

import type { DailyReport } from "./summary"

type ReportUser = DailyReport[string]
type ReportCategory = NonNullable<ReportUser["items"]>[string]
type ReportProduct = {
  _id?: string | null
  id?: string | null
  productId?: string | null
  name?: string | null
  code?: string | null
  count?: number
  unitPrice?: number
  totalAmount?: number
}
type Amounts = NonNullable<ReportUser["ordersAmounts"]>

const DATE_FORMAT = "yyyy.MM.dd HH:mm"

const FIXED_AMOUNT_KEYS = [
  "_id",
  "cashAmount",
  "cardAmount",
  "mobileAmount",
  "count",
  "totalAmount",
  "receivableAmount",
]

const toNumber = (value?: number | string) => Number(value) || 0

const formatNum = (value?: number | string) => toNumber(value).toLocaleString()

const normalizeText = (value?: string | null) => value?.trim() || ""

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const getProductSizeFromCode = (code?: string | null) => {
  const parts = normalizeText(code)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)

  return parts.length > 1 ? parts[parts.length - 1] : ""
}

const hasStandaloneSize = (name: string, size: string) =>
  new RegExp(`(^|\\W)${escapeRegExp(size)}($|\\W)`, "i").test(name)

const getProductLabel = ({ name, code }: ReportProduct) => {
  const normalizedName = normalizeText(name)
  const size = getProductSizeFromCode(code)

  if (!normalizedName) {
    return normalizeText(code)
  }

  if (!size || hasStandaloneSize(normalizedName, size)) {
    return normalizedName
  }

  return `${normalizedName} / ${size}`
}

const getServiceChargeAmount = (totalAmount = 0, serviceCharge = 0) => {
  if (!totalAmount || !serviceCharge) {
    return 0
  }

  return Math.round(totalAmount * (serviceCharge / (100 + serviceCharge)))
}

const getProductTotal = (product: ReportProduct) =>
  product.totalAmount || (product.unitPrice || 0) * (product.count || 0)

const getProducts = (category: ReportCategory): ReportProduct[] =>
  Object.values(category.products || {})

const Row = ({
  label,
  value,
  className,
}: {
  label: React.ReactNode
  value: React.ReactNode
  className?: string
}) => (
  <div className={`report-print__row ${className || ""}`.trim()}>
    <span>{label}</span>
    <span className="report-print__value">{value}</span>
  </div>
)

const Divider = () => <div className="report-print__divider" />

const Receipt = ({ report }: { report?: DailyReport }) => {
  const config = useAtomValue(configAtom)
  const paymentTypes = useAtomValue(paymentTypesAtom)
  const reportStartDate = useAtomValue(reportStartDateAtom)
  const reportEndDate = useAtomValue(reportEndDateAtom)
  const qzEnabled = useAtomValue(qzTrayEnabledAtom)
  const qzMainPrinter = useAtomValue(qzMainPrinterAtom)

  const handlePrint = async () => {
    if (!qzEnabled) {
      globalThis.window.print()
      return
    }
    if (!qzMainPrinter) {
      onError("Үндсэн принтер сонгогдоогүй байна")
      return
    }
    const ok = await ensureQzConnected()
    if (!ok) {
      onError(QZ_TRAY_NOT_RUNNING_MESSAGE)
      return
    }
    try {
      const html = await captureDocumentHtml()
      await printHtmlToPrinter(qzMainPrinter, html)
    } catch {
      onError(QZ_TRAY_NOT_RUNNING_MESSAGE)
    }
  }

  if (!report) {
    return null
  }

  const isServiceChargeProduct = (product: ReportProduct) => {
    const serviceProductId = config?.serviceChargeApplicableProductId
    const productIds = [product.productId, product._id, product.id].filter(
      Boolean
    )

    if (serviceProductId && productIds.includes(serviceProductId)) {
      return true
    }

    return normalizeText(product.name).toLowerCase().includes("service charge")
  }

  const getLineAmount = (product: ReportProduct, amounts?: Amounts) => {
    if (!isServiceChargeProduct(product)) {
      return getProductTotal(product)
    }

    return (
      getServiceChargeAmount(
        toNumber(amounts?.totalAmount),
        config?.serviceCharge
      ) || getProductTotal(product)
    )
  }

  const getPaymentTitle = (type: string) =>
    (paymentTypes || []).find((t: IPaymentType) => t.type === type)?.title ||
    type

  const renderPayments = (amounts: Amounts) => {
    const extraTypes = Object.keys(amounts).filter(
      (key) => !FIXED_AMOUNT_KEYS.includes(key)
    )

    return (
      <section className="report-print__section">
        <div className="report-print__section-title">Төлбөр</div>
        <Row label="Бэлнээр" value={formatNum(amounts.cashAmount)} />
        <Row label="Цахимаар" value={formatNum(amounts.mobileAmount)} />
        {!!toNumber(amounts.cardAmount) && (
          <Row label="Картаар" value={formatNum(amounts.cardAmount)} />
        )}
        {!!toNumber(amounts.receivableAmount) && (
          <Row label="Авлагаар" value={formatNum(amounts.receivableAmount)} />
        )}
        {extraTypes.map((type) => (
          <Row
            key={type}
            label={getPaymentTitle(type)}
            value={formatNum(amounts[type])}
          />
        ))}
        <Row
          label="Нийт дүн"
          value={formatNum(amounts.totalAmount)}
          className="report-print__row--total"
        />
        <Row label="Баримтын тоо" value={formatNum(amounts.count)} />
      </section>
    )
  }

  const renderProduct = (
    product: ReportProduct,
    key: string,
    amounts?: Amounts
  ) => (
    <div className="report-print__product" key={key}>
      <Row
        label={getProductLabel(product)}
        value={formatNum(getLineAmount(product, amounts))}
      />
      {!isServiceChargeProduct(product) && (
        <div className="report-print__muted">
          {formatNum(product.unitPrice)} × {formatNum(product.count)}
        </div>
      )}
    </div>
  )

  const renderCategory = (
    category: ReportCategory,
    key: string,
    amounts?: Amounts
  ) => {
    const products = getProducts(category)
    const count = products.reduce((sum, p) => sum + (p.count || 0), 0)
    const total = products.reduce(
      (sum, p) => sum + getLineAmount(p, amounts),
      0
    )

    return (
      <section className="report-print__category" key={key}>
        <Row
          label={normalizeText(category.name) || "Бусад"}
          value={`${formatNum(count)} ш`}
          className="report-print__category-head"
        />
        {products.map((product, index) =>
          renderProduct(product, `${key}:${index}`, amounts)
        )}
        <Row
          label="Дүн"
          value={formatNum(total)}
          className="report-print__category-total"
        />
      </section>
    )
  }

  const renderUser = (item: ReportUser, userId: string) => {
    const amounts = item.ordersAmounts || {}
    const name =
      item.user?.details?.fullName || item.user?.email || "Хэрэглэгчгүй"

    return (
      <div key={userId || "none"} className="report-print__user">
        <Divider />
        <Row label="Ажилтан" value={name} className="report-print__person" />
        {renderPayments(amounts)}
        {!!Object.keys(item.items || {}).length && (
          <>
            <Divider />
            <div className="report-print__section-title">Борлуулсан бараа</div>
            {Object.entries(item.items || {}).map(([key, category]) =>
              renderCategory(category, key, amounts)
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <PrintLayout>
      <div className="flex flex-col print:block">
        <div className="report-print">
          <header className="report-print__header">
            {!!config?.name && (
              <div className="report-print__brand">{config.name.trim()}</div>
            )}
            <div className="report-print__title">Өдрийн тайлан</div>
          </header>
          <div className="report-print__meta">
            <Row
              label="Эхлэх"
              value={format(reportStartDate || new Date(), DATE_FORMAT)}
            />
            <Row
              label="Дуусах"
              value={format(reportEndDate || new Date(), DATE_FORMAT)}
            />
            <Row label="Хэвлэсэн" value={format(new Date(), DATE_FORMAT)} />
          </div>

          {Object.entries(report).map(([userId, item]) =>
            renderUser(item, userId)
          )}

          <Divider />
          <footer className="report-print__signatures">
            <div className="report-print__sign">
              <span>Хүлээлгэн өгсөн</span>
              <span className="report-print__sign-line" />
            </div>
            <div className="report-print__sign">
              <span>Хүлээн авсан</span>
              <span className="report-print__sign-line" />
            </div>
          </footer>
        </div>

        <div className="px-2 pb-2 pt-3 print:hidden">
          <Button onClick={handlePrint} className="h-9 w-full px-3 text-xs">
            <PrinterIcon className="mr-1.5 h-4 w-4" />
            Хэвлэх
          </Button>
        </div>
      </div>
    </PrintLayout>
  )
}

export default Receipt
