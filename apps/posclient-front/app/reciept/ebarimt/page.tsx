"use client"

import { useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { queries } from "@/modules/orders/graphql"
import { modeAtom } from "@/store"
import { ebarimtConfigAtom } from "@/store/config.store"
import {
  printTypeAtom,
  putResponsesAtom,
  setOrderStatesAtom,
} from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { BILL_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { onError } from "@/components/ui/use-toast"
import Amount from "@/app/reciept/components/Amount"
import Footer from "@/app/reciept/components/footer"
import EbarimtHeader from "@/app/reciept/components/header"
import PutResponses from "@/app/reciept/components/putResponses"

const Reciept = () => {
  const searchParams = useSearchParams()
  const _id = searchParams.get("id")

  const mode = useAtomValue(modeAtom)
  const [type, setType] = useAtom(printTypeAtom)
  const putResponses = useAtomValue(putResponsesAtom)
  const setOrderStates = useSetAtom(setOrderStatesAtom)

  const { hasCopy } = useAtomValue(ebarimtConfigAtom) || {}

  const { loading, data } = useQuery(queries.ebarimtDetail, {
    fetchPolicy: "network-only",
    onError({ message }) {
      onError(message)
    },
    skip: !_id,
    variables: { _id },
  })

  useEffect(() => {
    if (data) {
      const { orderDetail } = data
      if (orderDetail?._id === _id) {
        setOrderStates(orderDetail)
        data.billType === BILL_TYPES.INNER && setType("inner")
        setTimeout(() => window.print(), 50)
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

    if (mode === "mobile") {
      return window.close()
    }

    const data = { message: "close" }
    window.parent.postMessage(data, "*")
  }, [hasCopy, mode, putResponses.length, setType, type])

  useEffect(() => {
    if (mode === "mobile") {
      return
    }
    window.addEventListener("afterprint", handleAfterPrint)
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleAfterPrint])

  if (loading) {
    return null
  }

  return (
    <>
      <EbarimtHeader />
      <PutResponses />
      <Amount />
      <Footer />
      <Button
        onClick={handleClick}
        className="px-6 text-xs print:hidden w-full"
        variant="secondary"
      >
        хэвлэх
      </Button>
    </>
  )
}

export default Reciept
