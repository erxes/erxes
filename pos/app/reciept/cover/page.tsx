"use client"

import { useSearchParams } from "next/navigation"
import useConfig from "@/modules/auth/hooks/useConfig"
import { coverConfigAtom } from "@/store/config.store"
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

  const { loading: loadingConfig } = useConfig("cover")
  const { loading, data } = useQuery(queries.recieptDetail, {
    variables: { id },
  })
  const config = useAtomValue(coverConfigAtom)

  if (loading || loadingConfig) return <div></div>

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

  const { paymentTypes } = config || {}

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
    <>
      <h1 className="text-xs font-semibold">Хаалтын баримт</h1>
      <div className="flex items-center">
        Үүсгэсэн: {createdUser?.email} /{formatDate(createdAt)}/
      </div>
      <div className="flex items-center">
        Баталгаажуулсан: {modifiedUser?.email} /{formatDate(modifiedAt)}/
      </div>
      <div className="flex items-center">
        Огноо: {formatDate(beginDate)} - {formatDate(endDate)}
      </div>

      {cashDetail && (
        <div>
          <div className="font-semibold">Бэлнээр</div>
          <div className="flex items-center">
            <span className="w-1/3">Дэвсгэрт</span>
            <span className="w-1/3 text-center">Тоо ширхэг</span>
            <span className="w-1/3 text-right">Дүн</span>
          </div>
          <Separator />
          {cashDetail?.paidSummary.map((ps: PaidSum, i: number) => (
            <div className="flex items-center" key={i}>
              <span className="w-1/3">{ps.kindOfVal}</span>
              <span className="w-1/3 text-center">{ps.value}</span>
              <span className="w-1/3 text-right">
                {(ps.amount || ps.kindOfVal * (ps.value || 0)).toLocaleString()}
              </span>
            </div>
          ))}

          <Separator />
          <div className="flex items-center">
            <span className="w-1/3">Систем дүн</span>
            <span className="w-1/3 text-center">Зөрүү</span>
            <span className="w-1/3 text-right">Нийт</span>
          </div>
          <Separator />
          <div className="flex items-center">
            <span className="w-1/3">{cashDetail.paidDetail || 0}</span>
            <span className="w-1/3 text-center">
              {(cashDetail.paidDetail - totalCash).toLocaleString()}
            </span>
            <span className="w-1/3 text-right">
              {totalCash.toLocaleString()}
            </span>
          </div>
          <Separator />
        </div>
      )}

      {nonCash.map((ps: Detail, i: number) => (
        <div key={i}>
          <div className="font-semibold">{getTitle(ps.paidType)}</div>
          <div className="flex items-center">
            <span className="w-1/3">Систем дүн</span>
            <span className="w-1/3 text-center">Зөрүү</span>
            <span className="w-1/3 text-right">Нийт</span>
          </div>
          <Separator />
          <div className="flex items-center">
            {!ALL_BANK_CARD_TYPES.includes(ps.paidType) ? (
              <>
                <span className="w-1/3">{ps.paidDetail}</span>
                <span className="w-1/3 text-center">
                  {Number(ps.paidDetail) - (ps.paidSummary[0]?.amount || 0)}
                </span>
              </>
            ) : (
              <div className="w-2/3" />
            )}
            <span className="w-1/3 text-right">
              {ps.paidSummary[0]?.amount}
            </span>
          </div>
          <Separator />
          {ALL_BANK_CARD_TYPES.includes(ps.paidType) && (
            <>
              <div>Тэмдэглэл: </div>
              <div
                dangerouslySetInnerHTML={{ __html: ps.paidDetail + "" }}
              ></div>
              <Separator />
            </>
          )}
        </div>
      ))}

      <div>
        <div className="font-semibold">Тэмдэглэл:</div>
        <div dangerouslySetInnerHTML={{ __html: description }}></div>
      </div>
      <div>
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
    </>
  )
}

export default Cover
