import { printTypeAtom, putResponsesAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { IPutResponse } from "@/types/order.types"
import { cn } from "@/lib/utils"

import Ebarimt from "./Ebarimt"
import Error from "./Error"
import Stocks from "./Stocks"

export const PutResponse = ({
  id,
  receipts,
  status,
  message,
  ...rest
}: IPutResponse) => {
  const type = useAtomValue(printTypeAtom)
  return (
    <div className={cn("space-y-1")}>
      {!type && (
        <div className="receipt-print__row flex items-center">
          <p className="font-semibold">ДДТД:</p>
          <p className="font-normal tabular-nums">{id}</p>
        </div>
      )}
      <Stocks receipts={receipts || []} />
      {status !== "SUCCESS" && <Error message={message} />}

      <Ebarimt {...rest} />
    </div>
  )
}

const PutResponses = () => {
  const [putResponses] = useAtom(putResponsesAtom)
  return (
    <div className="space-y-2">
      {(putResponses || []).map((putResponse) => (
        <PutResponse {...putResponse} key={putResponse.contentId} />
      ))}
    </div>
  )
}

export default PutResponses
