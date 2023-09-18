"use client"

import { useCallback, useEffect } from "react"
import useConfig from "@/modules/auth/hooks/useConfig"
import { ebarimtDetail } from "@/modules/orders/graphql/queries"
import useOrderDetail from "@/modules/orders/hooks/useOrderDetail"
import {
  activeOrderAtom,
  printTypeAtom,
  putResponsesAtom,
  setOrderStatesAtom,
} from "@/store/order.store"
import { useAtom } from "jotai"

import { BILL_TYPES } from "@/lib/constants"
import { getMode } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Amount from "@/app/reciept/components/Amount"
import EbarimtSkeleton from "@/app/reciept/components/Skeleton"
import Footer from "@/app/reciept/components/footer"
import EbarimtHeader from "@/app/reciept/components/header"
import PutResponses from "@/app/reciept/components/putResponses"
import { useSearchParams } from 'next/navigation'

const Reciept = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') 

  const mode = getMode()
  const [type, setType] = useAtom(printTypeAtom)
  const [putResponses] = useAtom(putResponsesAtom)
  const [, setOrderStates] = useAtom(setOrderStatesAtom)
  const { config, loading } = useConfig("ebarimt")

  const { hasCopy } = config.ebarimtConfig || {}

  const { loading: loadingDetail } = useOrderDetail({
    query: ebarimtDetail,
    onCompleted: (data) => {
      setOrderStates(data)
      data.billType === BILL_TYPES.INNER && setType("inner")
      return setTimeout(() => window.print(), 20)
    },
  })

  const [activeOrder, setActive] = useAtom(activeOrderAtom)

  useEffect(() => {
    !!id && setActive(id)
  }, [id, setActive])

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

  if (loading || loadingDetail || !activeOrder) return <EbarimtSkeleton />

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
