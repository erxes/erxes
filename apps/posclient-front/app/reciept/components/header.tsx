/* eslint-disable @next/next/no-img-element */
import { configAtom } from "@/store/config.store"
import { getEnv, READ_FILE } from "@/lib/utils"
import {
  customerAtom,
  orderNumberAtom,
  orderUserAtom,
  paidDateAtom,
} from "@/store/order.store"
import { format } from "date-fns"
import { useAtomValue } from "jotai"

const getReceiptIconSrc = (receiptIcon: string) => {
  if (
    receiptIcon.startsWith("/") ||
    receiptIcon.startsWith("http://") ||
    receiptIcon.startsWith("https://") ||
    receiptIcon.includes(READ_FILE)
  ) {
    return receiptIcon
  }

  const apiDomain = (getEnv().NEXT_PUBLIC_MAIN_API_DOMAIN || "").replace(
    /\/$/,
    ""
  )

  return `${apiDomain}${READ_FILE}${receiptIcon}`
}

const EbarimtHeader = () => {
  const user = useAtomValue(orderUserAtom)
  const number = useAtomValue(orderNumberAtom)
  const paidDate = useAtomValue(paidDateAtom)
  const { name, uiOptions, ebarimtConfig } = useAtomValue(configAtom) || {}
  const { receiptIcon } = uiOptions || {}
  const customer = useAtomValue(customerAtom)

  const renderPerson = (isCus?: boolean) => {
    const person = isCus ? customer : user
    const { _id, primaryPhone, firstName, primaryEmail, lastName } =
      person || {}

    if (!_id) return

    if (!isCus && !firstName) return

    return (
      <div className="flex items-center gap-1">
        <div>{isCus ? "Харилцагч" : "Ажилтан"}:</div>
        <span>
          {firstName || ""} {lastName || ""}
          {isCus && ` ${primaryPhone || ""} ${primaryEmail}`}
        </span>
      </div>
    )
  }
  return (
    <>
      <header className="flex items-center justify-center border-b border-black/15 pb-2">
        {receiptIcon && (
          <img
            src={getReceiptIconSrc(receiptIcon)}
            alt=""
            className="h-10 max-w-[100px] object-contain"
            loading="eager"
          />
        )}
        <p className="receipt-print__title pl-2">
          {ebarimtConfig?.companyName || name}
        </p>
      </header>
      <div className="receipt-print__section receipt-print__section--flush space-y-1">
        {ebarimtConfig?.headerText && (
          <div
            dangerouslySetInnerHTML={{ __html: ebarimtConfig?.headerText }}
            className="whitespace-pre-line text-[11px]"
          />
        )}
        <div className="receipt-print__row grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <div className="flex min-w-0 items-start gap-1">
            <p className="font-semibold">Огноо:</p>
            <p className="min-w-0">
              {!!paidDate && format(new Date(paidDate), "yyyy.MM.dd HH:mm")}
            </p>
          </div>
          <div className="whitespace-nowrap font-semibold tabular-nums">
            &#8470;{":"} {number.split("_")[1]}
          </div>
        </div>
        {renderPerson()}
        {renderPerson(true)}
      </div>
    </>
  )
}

export default EbarimtHeader
