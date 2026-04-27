"use client"

import { useSearchParams } from "next/navigation"
import { paymentTypesAtom } from "@/store/config.store"
import { useQuery } from "@apollo/client"
import { format } from "date-fns"
import { useAtomValue } from "jotai"

import { Detail, PaidSum } from "@/types/cover.types"
import { ALL_BANK_CARD_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { queries } from "@/app/(main)/cover/graphql"

const Cover = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const { loading, data } = useQuery(queries.recieptDetail, {
    variables: { id },
  })
  const paymentTypes = useAtomValue(paymentTypesAtom)

  if (loading) return <div></div>

  const {
    beginDate,
    createdUser,
    createdAt,
    modifiedUser,
    modifiedAt,
    endDate,
    description,
    details,
  } = data?.coverDetail || {}

  const cashDetail = details.find(
    (detail: Detail) => detail.paidType === "cashAmount"
  )
  const nonCash = details.filter(
    (detail: Detail) => detail.paidType !== "cashAmount"
  )

  const totalCash = cashDetail?.paidSummary.reduce(
    (sum: number, ps: PaidSum) =>
      sum + (ps.amount || (ps.value || 0) * ps.kindOfVal),
    0
  )

  const formatDate = (date: string) =>
    format(new Date(date), "yyyy.MM.dd HH:mm")

  const getTitle = (type: string) =>
    paymentTypes?.find((pt) => pt.type === type)?.title

  return (
    <div className="space-y-2 receipt-print">
      <header className="pb-2 border-b border-black/15">
        <h1 className="receipt-print__title">Хаалтын баримт</h1>
        <p className="receipt-print__meta">
          <span className="font-semibold">Үүсгэсэн:</span> {createdUser?.email}{" "}
          /{formatDate(createdAt)}/
        </p>
        <p className="receipt-print__meta">
          <span className="font-semibold">Баталгаажуулсан:</span>{" "}
          {modifiedUser?.email} /{formatDate(modifiedAt)}/
        </p>
        <p className="receipt-print__meta">
          <span className="font-semibold">Огноо:</span> {formatDate(beginDate)}{" "}
          - {formatDate(endDate)}
        </p>
      </header>

      {cashDetail && (
        <div className="space-y-1 receipt-print__section">
          <div className="font-semibold">Бэлнээр</div>
          <div className="flex items-center font-semibold">
            <span className="w-1/3">Дэвсгэрт</span>
            <span className="w-1/3 text-center">Тоо ширхэг</span>
            <span className="w-1/3 text-right">Дүн</span>
          </div>
          <Separator className="bg-black/15" />
          {cashDetail?.paidSummary.map((ps: PaidSum, i: number) => (
            <div className="flex items-center receipt-print__row" key={i}>
              <span className="w-1/3">{ps.kindOfVal}</span>
              <span className="w-1/3 text-center tabular-nums">{ps.value}</span>
              <span className="w-1/3 font-semibold text-right tabular-nums">
                {(ps.amount || ps.kindOfVal * (ps.value || 0)).toLocaleString()}
              </span>
            </div>
          ))}

          <Separator className="bg-black/15" />
          <div className="flex items-center font-semibold">
            <span className="w-1/3">Систем дүн</span>
            <span className="w-1/3 text-center">Зөрүү</span>
            <span className="w-1/3 text-right">Нийт</span>
          </div>
          <Separator className="bg-black/15" />
          <div className="flex items-center receipt-print__row">
            <span className="w-1/3 tabular-nums">
              {cashDetail.paidDetail || 0}
            </span>
            <span className="w-1/3 text-center tabular-nums">
              {(cashDetail.paidDetail - totalCash).toLocaleString()}
            </span>
            <span className="w-1/3 font-semibold text-right tabular-nums">
              {totalCash.toLocaleString()}
            </span>
          </div>
          <Separator className="bg-black/15" />
        </div>
      )}

      {nonCash.map((ps: Detail, i: number) => (
        <div key={i} className="space-y-1 receipt-print__section">
          <div className="font-semibold">{getTitle(ps.paidType)}</div>
          <div className="flex items-center font-semibold">
            <span className="w-1/3">Систем дүн</span>
            <span className="w-1/3 text-center">Зөрүү</span>
            <span className="w-1/3 text-right">Нийт</span>
          </div>
          <Separator className="bg-black/15" />
          <div className="flex items-center receipt-print__row">
            {!ALL_BANK_CARD_TYPES.includes(ps.paidType) ? (
              <>
                <span className="w-1/3 tabular-nums">{ps.paidDetail}</span>
                <span className="w-1/3 text-center tabular-nums">
                  {Number(ps.paidDetail) - (ps.paidSummary[0]?.amount || 0)}
                </span>
              </>
            ) : (
              <div className="w-2/3" />
            )}
            <span className="w-1/3 font-semibold text-right tabular-nums">
              {ps.paidSummary[0]?.amount}
            </span>
          </div>
          <Separator className="bg-black/15" />
          {ALL_BANK_CARD_TYPES.includes(ps.paidType) && (
            <>
              <div className="font-semibold">Тэмдэглэл:</div>
              <div
                dangerouslySetInnerHTML={{ __html: ps.paidDetail + "" }}
              ></div>
              <Separator className="bg-black/15" />
            </>
          )}
        </div>
      ))}

      <div className="receipt-print__section">
        <div className="font-semibold">Тэмдэглэл:</div>
        <div dangerouslySetInnerHTML={{ __html: description }}></div>
      </div>
      <div className="receipt-print__section">
        <span className="font-semibold">Гарын үсэг:</span>{" "}
        ________________________
      </div>
      <Button
        onClick={() => window.print()}
        // variant="secondary"
        className="w-full text-xs print:hidden"
        size={"sm"}
      >
        Хэвлэх
      </Button>
    </div>
  )
}

export default Cover
