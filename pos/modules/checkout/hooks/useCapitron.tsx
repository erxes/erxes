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
  onCompleted: () => void
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
