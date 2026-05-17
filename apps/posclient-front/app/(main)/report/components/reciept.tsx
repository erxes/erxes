import { reportEndDateAtom, reportStartDateAtom } from "@/store"
import { configAtom, paymentTypesAtom } from "@/store/config.store"
import { format } from "date-fns"
import { useAtomValue } from "jotai"

import { IPaymentType } from "@/types/config.types"
import { Button } from "@/components/ui/button"
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
  _id?: string | null
  id?: string | null
  productId?: string | null
  name?: string | null
  code?: string | null
  count?: number
  unitPrice?: number
  totalAmount?: number
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

const getServiceChargeAmount = (totalAmount = 0, serviceCharge = 0) => {
  if (!totalAmount || !serviceCharge) {
    return 0
  }

  return Math.round(totalAmount * (serviceCharge / (100 + serviceCharge)))
}

const Receipt = ({ date, report }: any) => {
  const config = useAtomValue(configAtom)
  const paymentTypes = useAtomValue(paymentTypesAtom)
  const reportStartDate = useAtomValue(reportStartDateAtom)
  const reportEndDate = useAtomValue(reportEndDateAtom)

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

  const getProductTotal = (product: ReportProduct) =>
    product.totalAmount || (product.unitPrice || 0) * (product.count || 0)

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

  const renderProduct = (product: ReportProduct, ordersAmounts?: any) => {
    const isServiceCharge = isServiceChargeProduct(product)
    const serviceChargeAmount = getServiceChargeAmount(
      ordersAmounts?.totalAmount,
      config?.serviceCharge
    )

    return (
      <div
        className="report-print__product"
        key={product.code || product.name}
      >
        <div className="report-print__product-name">
          {getProductLabel(product)}
        </div>
        <div className="report-print__product-amount tabular-nums">
          {isServiceCharge ? (
            formatNum(serviceChargeAmount || getProductTotal(product))
          ) : (
            <>
              {formatNum(product.unitPrice)} * {formatNum(product.count)} ={" "}
              {formatNum(getProductTotal(product))}
            </>
          )}
        </div>
      </div>
    )
  }

  const renderCategory = (category: any, ordersAmounts?: any) => {
    return (
      <>
        <div key={Math.random()} className="report-print__category">
          <b className="font-semibold">
            {`Барааны бүлэг: `} {category.name}
          </b>
        </div>
        <div className="report-print__product-header">
          <span>Барааны нэр</span>
          <span>Үнэ * Тоо = Дүн</span>
        </div>

        {Object.keys(category.products).map((p) =>
          renderProduct(category.products[p], ordersAmounts)
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
        {Object.keys(item.items).map((i) =>
          renderCategory(item.items[i], item.ordersAmounts)
        )}
      </div>
    )
  }

  //   <div className="h-full px-1 mx-4 overflow-auto print:overflow-visible print:mx-0">

  return (
    <PrintLayout>
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
        {Object.keys(report || {}).map((userId) => renderUser(report[userId]))}
        <footer className="space-y-1 report-print__signature">
          <label className="font-semibold">Гарын үсэг:</label>
          <span> _____________________</span>
        </footer>

        <Button
          onClick={() => window.print()}
          className="print:hidden fixed bottom-4 w-full max-w-[70mm] mx-auto px-2 z-10"
          size="sm"
        >
          Хэвлэх
        </Button>
      </div>
    </PrintLayout>
  )
}

export default Receipt
