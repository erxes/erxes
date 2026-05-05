import {
  qzMainPrinterAtom,
  qzTrayEnabledAtom,
  reportEndDateAtom,
  reportStartDateAtom,
} from "@/store"
import { paymentTypesAtom } from "@/store/config.store"
import { format } from "date-fns"
import { useAtomValue } from "jotai"

import { IPaymentType } from "@/types/config.types"
import { captureDocumentHtml } from "@/lib/captureHtml"
import {
  QZ_TRAY_NOT_RUNNING_MESSAGE,
  ensureQzConnected,
  printHtmlToPrinter,
} from "@/lib/qzTray"
import { Button } from "@/components/ui/button"
import { onError } from "@/components/ui/use-toast"
import PrintLayout from "@/app/reciept/layout"

const formatNum = (num?: number) => (num || 0).toLocaleString()
const Flex = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={`report-print__row flex items-start justify-between gap-2 ${
      className || ""
    }`.trim()}
  >
    {children}
  </div>
)

type ReportProduct = {
  name?: string | null
  code?: string | null
  count?: number
}

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

const hasStandaloneSize = (name: string, size: string) => {
  const matcher = new RegExp(`(^|\\W)${escapeRegExp(size)}($|\\W)`, "i")

  return matcher.test(name)
}

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

const Receipt = ({ date, report }: any) => {
  const paymentTypes = useAtomValue(paymentTypesAtom)
  const reportStartDate = useAtomValue(reportStartDateAtom)
  const reportEndDate = useAtomValue(reportEndDateAtom)
  const qzEnabled = useAtomValue(qzTrayEnabledAtom)
  const qzMainPrinter = useAtomValue(qzMainPrinterAtom)

  const handlePrint = async () => {
    if (!qzEnabled) {
      window.print()
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

  const excludeTypes = [
    "_id",
    "cashAmount",
    "cardAmount",
    "mobileAmount",
    "count",
    "totalAmount",
    "receivableAmount",
  ]

  const renderAmounts = (amounts: any) => {
    return (
      <div className="pt-3 report-print__section md:pt-0">
        <Flex>
          {`Бэлнээр: `}
          <span className="report-print__value tabular-nums">
            {formatNum(amounts.cashAmount)}
          </span>
        </Flex>
        <Flex>
          {`Цахимаар: `}
          <span className="report-print__value tabular-nums">
            {formatNum(amounts.mobileAmount)}
          </span>
        </Flex>
        {(amounts.cardAmount && (
          <Flex>
            {`Картаар: `}
            <span className="report-print__value tabular-nums">
              {formatNum(amounts.cardAmount)}
            </span>
          </Flex>
        )) ||
          ""}
        {(amounts.receivableAmount && (
          <Flex>
            {`Картаар: `}
            <span className="report-print__value tabular-nums">
              {formatNum(amounts.receivableAmount)}
            </span>
          </Flex>
        )) ||
          ""}

        {(Object.keys(amounts) || [])
          .filter((key) => !excludeTypes.includes(key))
          .map((type) => (
            <Flex key={type}>
              {`${
                (
                  (paymentTypes || []).find(
                    (t: IPaymentType) => t.type === type
                  ) || {
                    title: type,
                  }
                ).title
              }: `}
              <span className="report-print__value tabular-nums">
                {formatNum(amounts[type])}
              </span>
            </Flex>
          ))}

        <Flex>
          {`Нийт: `}
          <span className="report-print__value tabular-nums">
            {formatNum(amounts.totalAmount)}
          </span>
        </Flex>
        <Flex>
          {`Б.тоо: `}
          <span className="report-print__value tabular-nums">
            {formatNum(amounts.count)}
          </span>
        </Flex>
      </div>
    )
  }

  const renderProduct = (product: ReportProduct) => {
    return (
      <Flex
        className="pl-2 report-print__product"
        key={product.code || product.name}
      >
        {`${getProductLabel(product)}: `}{" "}
        <span className="report-print__value tabular-nums">
          {formatNum(product.count)}
        </span>
      </Flex>
    )
  }

  const renderCategory = (category: any) => {
    return (
      <>
        <div key={Math.random()} className="report-print__category">
          <b className="font-semibold">
            {`Барааны бүлэг: `} {category.name}
          </b>
        </div>

        {Object.keys(category.products).map((p) =>
          renderProduct(category.products[p])
        )}
      </>
    )
  }

  const renderUser = (item: any) => {
    return (
      <div key={Math.random()} className="block report-print__user">
        <b className="font-semibold flex-v-center">
          <span>{`Хэрэглэгч: `}</span>
          <span>{item.user.email}</span>
        </b>
        {renderAmounts(item.ordersAmounts)}
        {Object.keys(item.items).map((i) => renderCategory(item.items[i]))}
      </div>
    )
  }

  //   <div className="h-full px-1 mx-4 overflow-auto print:overflow-visible print:mx-0">

  return (
    <PrintLayout>
      <div className="flex min-h-[calc(100vh-1rem)] flex-col print:block print:min-h-0">
        <div className="report-print">
          <header className="block pb-2 border-b border-black/15">
            <div className="report-print__title">Өдрийн тайлан</div>
            <p className="report-print__meta">
              Хамаарах:{" "}
              <b className="font-semibold">
                {format(reportStartDate || new Date(), "yyyy.MM.dd HH:mm")} -{" "}
                {format(reportEndDate || new Date(), "yyyy.MM.dd HH:mm")}
              </b>
            </p>
            <p className="report-print__meta">
              Хэвлэсэн:{" "}
              <b className="font-semibold">
                {format(new Date(), "yyyy.MM.dd HH:mm")}
              </b>
            </p>
          </header>
          {Object.keys(report || {}).map((userId) =>
            renderUser(report[userId])
          )}
          <footer className="space-y-1 report-print__signature">
            <label className="font-semibold">Гарын үсэг:</label>
            <span> _____________________</span>
          </footer>
        </div>

        <div className="sticky bottom-4 z-10 mt-auto px-4 pb-4 print:hidden">
          <Button
            onClick={handlePrint}
            className="h-9 w-full px-3 text-xs shadow-md"
            size="sm"
          >
            Хэвлэх
          </Button>
        </div>
      </div>
    </PrintLayout>
  )
}

export default Receipt
