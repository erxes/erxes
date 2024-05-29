  import { ebarimtConfigAtom } from "@/store/config.store"
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
  const ebarimtConfig = useAtomValue(ebarimtConfigAtom)
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
      <header className="flex items-center justify-center">
        {ebarimtConfig?.uiOptions?.receiptIcon && (
          <Image
            src={ebarimtConfig?.uiOptions?.receiptIcon}
            alt=""
            height={32}
            width={100}
            className="h-8 w-auto object-contain"
          />
        )}
        <p className="pl-2 font-bold leading-5">{ebarimtConfig?.name}</p>
      </header>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <p className="w-10 font-semibold">Огноо:</p>
          <p>{!!paidDate && format(new Date(paidDate), "yyyy.MM.dd HH:mm")}</p>
        </div>

        <div className="font-medium">
          {" "}
          &#8470;{":"} {number.split("_")[1]}
        </div>
      </div>

      {renderPerson()}
      {renderPerson(true)}
    </>
  )
}

export default EbarimtHeader
