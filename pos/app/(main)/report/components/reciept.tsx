import { reportDateAtom } from "@/store"
import { paymentTypesAtom } from "@/store/config.store"
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
}) => <div className="flex items-center justify-between">{children}</div>

const Receipt = ({ date, report }: any) => {
  const paymentTypes = useAtomValue(paymentTypesAtom)
  const reportDate = useAtomValue(reportDateAtom)

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
      <div className="pt-4 md:pt-0">
        <Flex>
          {`Бэлнээр: `}
          <span>{formatNum(amounts.cashAmount)}</span>
        </Flex>
        <Flex>
          {`Цахимаар: `} <span>{formatNum(amounts.mobileAmount)}</span>
        </Flex>
        {(amounts.cardAmount && (
          <Flex>
            {`Картаар: `} <span>{formatNum(amounts.cardAmount)}</span>
          </Flex>
        )) ||
          ""}
        {(amounts.receivableAmount && (
          <Flex>
            {`Картаар: `} <span>{formatNum(amounts.receivableAmount)}</span>
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
              <span>{formatNum(amounts[type])}</span>
            </Flex>
          ))}

        <Flex>
          {`Нийт: `} <span>{formatNum(amounts.totalAmount)}</span>
        </Flex>
        <Flex>
          {`Б.тоо: `} <span>{formatNum(amounts.count)}</span>
        </Flex>
      </div>
    )
  }

  const renderProduct = (product: any) => {
    return (
      <Flex className="printDocument-product" key={Math.random()}>
        {`${product.name}: `} <span>{formatNum(product.count)}</span>
      </Flex>
    )
  }

  const renderCategory = (category: any) => {
    return (
      <>
        <div key={Math.random()} className="category">
          <b>
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
      <div key={Math.random()} className="printDocument-user block">
        <b className="flex-v-center">
          <span>{`Хэрэглэгч: `}</span>
          <span>{item.user.email}</span>
        </b>
        {renderAmounts(item.ordersAmounts)}
        {Object.keys(item.items).map((i) => renderCategory(item.items[i]))}
      </div>
    )
  }

  //   <div className=" overflow-auto h-full print:overflow-visible mx-4 px-1 print:mx-0">

  return (
    <PrintLayout>
      <header className="block">
        <div className="font-bold text-xs">Өдрийн тайлан</div>
        <p>
          Хамаарах:{" "}
          <b>{format(reportDate || new Date(), "yyyy.MM.dd HH:mm")}</b>
        </p>
        <p>Хэвлэсэн: {format(new Date(), "yyyy.MM.dd HH:mm")}</p>
      </header>
      {Object.keys(report || {}).map((userId) => renderUser(report[userId]))}
      <footer className="space-y-1">
        <p>
          <label>Гарын үсэг:</label>
          <span> _____________________</span>
        </p>

        <Button
          onClick={() => window.print()}
          className="print:hidden fixed bottom-4 w-full max-w-[70mm] mx-auto px-2 z-10"
          size="sm"
        >
          Хэвлэх
        </Button>
      </footer>
    </PrintLayout>
  )
}

export default Receipt
