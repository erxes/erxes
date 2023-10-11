import { BANK_CARD_TYPES } from "@/lib/constants"
import { toast } from "@/components/ui/use-toast"

import usePaymentType from "./usePaymentType"

export const objToString = (details: any) => {
  const formBody = []
  for (var property in details) {
    var encodedKey = encodeURIComponent(property)
    var encodedValue = encodeURIComponent(details[property])
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
  const paymentType = usePaymentType(BANK_CARD_TYPES.TDB)
  return { paymentType }
}

export const useTDBTransaction = (options: {
  onCompleted: () => void
  onError: () => void
}) => {
  const { onCompleted, onError } = options
  const paymentType = usePaymentType(BANK_CARD_TYPES.TDB)
  const { port } = paymentType?.config || {}

  const TDBTransaction = async (variables: { _id: string; amount: number }) => {
    const { _id, amount } = variables
    fetch(endPoint(port), {
      method,
      headers,
      body: objToString({
        operation: "Sale",
        ecrRefNo: _id,
        amount: amount.toString(),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        const { ecrResult } = res || {}
        const { RespCode } = res.ecrResult || {}
        if (RespCode === "00") {
          toast({
            description: "Transaction was successful",
          })
          return !!onCompleted && onCompleted()
        }
        toast({ description: `${ecrResult}`, variant: "destructive" })
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
