import { printTypeAtom, putResponsesAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { IPutResponse } from "@/types/order.types"
import { cn } from "@/lib/utils"

import Ebarimt from "./Ebarimt"
import Error from "./Error"
import Stocks from "./Stocks"

export const PutResponse = ({
  taxType,
  billId,
  stocks,
  errorCode,
  message,
  ...rest
}: IPutResponse) => {
  const type = useAtomValue(printTypeAtom)
  return (
    <div className={cn("space-y-1")}>
      {!type && (
        <div className="flex items-center">
          <p className="w-10 font-semibold">ДДТД:</p>
          <p>{billId}</p>
        </div>
      )}
      <Stocks stocks={stocks} />
      <Error errorCode={errorCode} message={message} />
      <Ebarimt {...rest} />
    </div>
  )
}

const PutResponses = () => {
  const [putResponses] = useAtom(putResponsesAtom)
  return (
    <>
      {(putResponses || []).map((putResponse) => (
        <PutResponse {...putResponse} key={putResponse.billId} />
      ))}
    </>
  )
}

export default PutResponses
