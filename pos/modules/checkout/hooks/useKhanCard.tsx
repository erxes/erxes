import { useEffect, useState } from "react"

import { IBillType } from "@/types/order.types"
import { BANK_CARD_TYPES } from "@/lib/constants"
import { useToast } from "@/components/ui/use-toast"

import usePaymentType from "./usePaymentType"

const PATH = "http://localhost:27028"

const useKhanCard = (args?: { skipCheck?: boolean }) => {
  const { skipCheck } = args || {}
  const [loading, setLoading] = useState(true)
  const [isAlive, setIsAlive] = useState(false)

  const { type } = usePaymentType(BANK_CARD_TYPES.KHANBANK) || {}

  const checkIsAlive = (options?: {
    onCompleted?: () => void
    onError?: () => void
  }) => {
    const { onCompleted, onError } = options || {}
    if (!type) return setLoading(false)

    fetch(`${PATH}/ajax/get-status-info`)
      .then((res) => res.json())
      .then((res: any) => {
        if (res && res.status_code === "ok") {
          setLoading(false)
          setIsAlive(true)
          !!onCompleted && onCompleted()
        }
      })
      .catch(() => {
        setLoading(false)
        onError && onError()
      }) //todo: handle error
  }

  useEffect(() => {
    if (skipCheck) {
      setLoading(false)
      setIsAlive(true)
      return
    }
    checkIsAlive()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { checkIsAlive, loading, isAlive }
}

export const useSendTransaction = ({
  onCompleted,
  onError,
}: {
  onCompleted: () => void
  onError: () => void
}) => {
  const { onError: errorHandle, toast } = useToast()
  const [loading, setLoading] = useState(true)

  const error = (message: string) => {
    onError && onError()
    errorHandle({ message })
  }

  const sendTransaction = async ({
    number,
    amount,
    billType,
  }: {
    number: string
    amount: number
    billType: IBillType
  }) =>
    fetch(PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_name: "doSaleTransaction",
        service_params: {
          // special character _ is not accepted
          db_ref_no: number.replace("_", ""),
          amount: amount.toString(),
          vatps_bill_type: billType,
        },
      }),
    })
      .then((res) => res.json())
      .then((r) => {
        const { response, status } = r || {}

        if (status && response) {
          const { response_code, response_msg } = response
          if (response_code === "000") {
            toast({ description: "Transaction was successful" })
            onCompleted && onCompleted()
            return setLoading(false)
          }
          return error(response_msg)
        }

        if (!status && response) {
          const { Exception = { ErrorMessage: "" } } = response
          error(`${Exception.ErrorMessage}`)
        }
      })
      .catch((e) => error(e.message || e.toString()))

  return { loading, sendTransaction }
}

export const useSettlement = ({
  onCompleted,
  onError,
}: {
  onCompleted: (response: any) => void
  onError?: () => void
}) => {
  const { onError: errorHandle, toast } = useToast()
  const [loading, setLoading] = useState(false)
  const error = (message: string) => {
    onError && onError()
    setLoading(false)
    errorHandle({ message })
  }
  const sendSettlement = async ({ number }: { number: string }) => {
    setLoading(true)
    fetch(PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_name: "doSettlement",
        service_params: {
          db_ref_no: number,
        },
      }),
    })
      .then((res) => res.json())
      .then((r) => {
        const { response, status } = r || {}

        if (status && response) {
          const { response_code, response_msg } = response
          if (response_code === "000") {
            toast({ description: "Settlement was successful" })
            onCompleted && onCompleted(response)
            return setLoading(false)
          }
          return error(response_msg)
        }

        if (!status && response) {
          error(`${response?.response_msg}`)
        }
      })
      .catch((e) => error(e.message || e.toString()))
  }

  return { loading, sendSettlement }
}

export default useKhanCard
