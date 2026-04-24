import { configAtom } from "@/store/config.store"
import {
  customerAtom,
  orderNumberAtom,
  orderUserAtom,
  paidDateAtom,
} from "@/store/order.store"
import { format } from "date-fns"
import { useAtomValue } from "jotai"

import Image from "@/components/ui/image"

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
      <header className="flex items-center justify-center pb-2 border-b border-black/15">
        {receiptIcon && (
          <Image
            src={receiptIcon}
            alt=""
            height={32}
            width={100}
            className="object-contain w-auto h-8"
          />
        )}
        <p className="pl-2 receipt-print__title">
          {ebarimtConfig?.companyName || name}
        </p>
      </header>
      <div className="space-y-1 receipt-print__section receipt-print__section--flush">
        <div className="flex items-center justify-between receipt-print__row">
          <div className="flex items-center gap-1">
            <p className="font-semibold">Огноо:</p>
            <p>
              {!!paidDate && format(new Date(paidDate), "yyyy.MM.dd HH:mm")}
            </p>
          </div>

          <div className="font-semibold tabular-nums">
            &#8470;{":"} {number.split("_")[1]}
          </div>
        </div>

        {renderPerson()}
        {renderPerson(true)}
        {ebarimtConfig?.headerText && (
          <div
            dangerouslySetInnerHTML={{ __html: ebarimtConfig?.headerText }}
            className="whitespace-pre-line text-[11px]"
          />
        )}
      </div>
    </>
  )
}

export default EbarimtHeader
