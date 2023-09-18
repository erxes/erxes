import { BANK_CARD_TYPES } from "@/lib/constants"
import { convertToBase64, getLocal } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

import usePaymentType from "./usePaymentType"

export const initialData = {
  operationCode: "26",
  amount: "0",
  bandwidth: "115200",
  timeout: "540000",
  currencyCode: "496",
  cMode: "",
  cMode2: "",
  additionalData: "",
  cardEntryMode: "",
  fileData: "",
  requestID: "0",
}

const GOLOMT_DEFAULT_PATH = "http://localhost:8500"

const formatPath = (port?: string) =>
  port ? `http://localhost:${port}` : GOLOMT_DEFAULT_PATH

export const endPoint = (data: object, path?: string) =>
  `${formatPath(path)}/requestToPos/message?data=${convertToBase64(data)}`

const terminalID = getLocal("golomtId")

const useGolomt = () => {
  const { type } = usePaymentType(BANK_CARD_TYPES.GOLOMT)

  return { isIncluded: type && terminalID }
}

export const useGolomtTransaction = (options: {
  onCompleted: (data: any) => void
  onError: (data: any) => void
}) => {
  const { onCompleted, onError } = options
  const { config } = usePaymentType(BANK_CARD_TYPES.GOLOMT)
  const { port } = config || {}

  const sendData = { ...initialData, ...config, terminalID }

  const sendTransaction = async (variables: {
    _id: string
    amount: number
  }) => {
    const { _id, amount } = variables
    fetch(
      endPoint(
        {
          ...sendData,
          requestID: _id,
          operationCode: "1",
          amount: (amount * 100).toString(),
        },
        port
      )
    )
      .then((res) => res.json())
      .then((r) => {
        const posResult = JSON.parse(r?.PosResult)
        const { responseCode } = posResult || {}
        if (responseCode === "00") {
          toast({
            description: "Transaction was successful",
          })
          return (
            !!onCompleted && onCompleted(decodeURIComponent(atob(posResult)))
          )
        }
        toast({ description: posResult.responseDesc, variant: "destructive" })
        return !!onError && onError(posResult.responseDesc)
      })
      .catch((e) => {
        toast({ description: e.message, variant: "destructive" })
        return !!onError && onError(e.message)
      })
  }

  return { sendTransaction }
}

export default useGolomt
