"use client"

import { useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import useConfig from "@/modules/auth/hooks/useConfig"
import { queries } from "@/modules/orders/graphql"
import {
  printTypeAtom,
  putResponsesAtom,
  setOrderStatesAtom,
} from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { BILL_TYPES } from "@/lib/constants"
import { getMode } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import Amount from "@/app/reciept/components/Amount"
import Footer from "@/app/reciept/components/footer"
import EbarimtHeader from "@/app/reciept/components/header"
import PutResponses from "@/app/reciept/components/putResponses"

const Reciept = () => {
  const searchParams = useSearchParams()
  const _id = searchParams.get("id")

  const mode = getMode()
  const [type, setType] = useAtom(printTypeAtom)
  const putResponses = useAtomValue(putResponsesAtom)
  const setOrderStates = useSetAtom(setOrderStatesAtom)
  const { config, loading } = useConfig("ebarimt")
  const { onError } = useToast()

  const { hasCopy } = config.ebarimtConfig || {}

  const { loading: loadingDetail, data } = useQuery(queries.ebarimtDetail, {
    fetchPolicy: "network-only",
    onError,
    skip: !_id,
    variables: { _id },
  })

  useEffect(() => {
    if (data) {
      const { orderDetail } = data
      if (orderDetail._id === _id) {
        setOrderStates(orderDetail)
        data.billType === BILL_TYPES.INNER && setType("inner")
        setTimeout(() => window.print(), 20)
      }
    }
  }, [_id, data, setOrderStates, setType])

  const handleClick = () => typeof window !== "undefined" && window.print()

  const handleAfterPrint = useCallback(() => {
    if (
      mode !== "kiosk" &&
      hasCopy &&
      putResponses.length &&
      type !== "inner"
    ) {
      setType("inner")
      return setTimeout(() => window.print(), 20)
    }

    const data = { message: "close" }
    window.parent.postMessage(data, "*")
  }, [hasCopy, mode, putResponses.length, setType, type])

  useEffect(() => {
    window.addEventListener("afterprint", handleAfterPrint)
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint)
    }
  }, [handleAfterPrint])

  if (loading || loadingDetail) return null

  return (
    <>
      <EbarimtHeader />
      <PutResponses />
      <Amount />
      <Footer />
      <Button
        onClick={handleClick}
        className="mx-3 w-40 text-xs font-bold print:hidden"
      >
        Print
      </Button>
    </>
  )
}

export default Reciept
