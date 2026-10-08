import { BANK_CARD_TYPES } from "@/lib/constants"
import { toast } from "@/components/ui/use-toast"

import usePaymentType from "./usePaymentType"

type TDBTransactionResponse = {
  ecrResult?: { RespCode?: string }
}

export const objToString = (details: Record<string, string | number | boolean>) => {
  const formBody = []
  for (const property in details) {
    const encodedKey = encodeURIComponent(property)
    const encodedValue = encodeURIComponent(details[property])
    formBody.push(encodedKey + "=" + encodedValue)
  }
  return formBody.join("&")
}

export const TDB_DEFAULT_PATH = "http://localhost:8088"
export const method = "POST"
export const headers = {
  "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
}
export const endPoint = (port?: string) =>
  (port ? `http://localhost:${port}` : TDB_DEFAULT_PATH) + `/ecrt1000`

const useTDB = () => {
  const tdb = usePaymentType(BANK_CARD_TYPES.TDB)
  return { paymentType: tdb }
}

export const useTDBTransaction = (options: {
  onCompleted: (
    data?: TDBTransactionResponse["ecrResult"]
  ) => Promise<void> | void
  onError: () => void
}) => {
  const { onCompleted, onError } = options
  const { paymentType } = useTDB()
  const { port } = paymentType?.config || {}

  const TDBTransaction = async (variables: { _id: string; amount: number }) => {
    const { _id, amount } = variables
    return fetch(endPoint(port), {
      method,
      headers,
      body: objToString({
        operation: "Sale",
        ecrRefNo: _id,
        amount: amount.toString(),
      }),
    })
      .then((res) => res.json())
      .then(async (res: TDBTransactionResponse) => {
        const { ecrResult } = res || {}
        const { RespCode } = ecrResult || {}
        if (RespCode === "00") {
          await onCompleted(ecrResult)
          toast({
            description: "Transaction was successful",
          })
          return
        }
        toast({
          description: `${JSON.stringify(ecrResult)}`,
          variant: "destructive",
        })
        !!onError && onError()
      })
      .catch((e) => {
        !!onError && onError()
        toast({ description: e.message, variant: "destructive" })
      })
  }

  return { TDBTransaction }
}

export default useTDB
