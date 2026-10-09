import { BANK_CARD_TYPES } from "@/lib/constants"
import { toast } from "@/components/ui/use-toast"

import usePaymentType from "./usePaymentType"

type CapitronTransactionResponse = {
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

export const CAPITRON_DEFAULT_PATH = "http://localhost:8088"
export const method = "POST"
export const headers = {
  "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
}
export const endPoint = (port?: string) =>
  (port ? `http://localhost:${port}` : CAPITRON_DEFAULT_PATH) + `/ecrt1000`

const useCapitron = () => {
  const capitron = usePaymentType(BANK_CARD_TYPES.CAPITRON)
  return { paymentType: capitron }
}

export const useCapitronTransaction = (options: {
  onCompleted: (
    data?: CapitronTransactionResponse["ecrResult"]
  ) => Promise<void> | void
  onError: () => void
}) => {
  const { onCompleted, onError } = options
  const { paymentType } = useCapitron()
  const { port } = paymentType?.config || {}

  const capitronTransaction = async (variables: {
    _id: string
    amount: number
  }) => {
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
      .then(async (res: CapitronTransactionResponse) => {
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

  return { capitronTransaction }
}

export default useCapitron
