"use client"

import { memo, useEffect } from "react"
import clientMain from "@/modules/apolloClientMain"
import { mutations } from "@/modules/checkout/graphql"
import { currentAmountAtom } from "@/store"
import { configAtom, paymentConfigAtom } from "@/store/config.store"
import {
  activeOrderIdAtom,
  customerAtom,
  customerTypeAtom,
  orderNumberAtom,
} from "@/store/order.store"
import { gql, useMutation } from "@apollo/client"
import { useAtomValue } from "jotai"

import Loader from "@/components/ui/loader"
import { useToast } from "@/components/ui/use-toast"

const MobileSheet = () => {
  const amount = useAtomValue(currentAmountAtom)
  const config = useAtomValue(configAtom)
  const paymentConfig = useAtomValue(paymentConfigAtom)
  const activeOrderId = useAtomValue(activeOrderIdAtom)
  const orderNumber = useAtomValue(orderNumberAtom)
  const customer = useAtomValue(customerAtom)
  const customerType = useAtomValue(customerTypeAtom)

  const { paymentIds } = paymentConfig || {}

  const { onError } = useToast()

  const [generateInvoiceUrl, { loading, data }] = useMutation(
    gql(mutations.generateInvoiceUrl),
    {
      client: clientMain,
      onError,
    }
  )

  const invoiceUrl = (data || {}).generateInvoiceUrl || ""

  useEffect(() => {
    if (activeOrderId && !invoiceUrl) {
      generateInvoiceUrl({
        variables: {
          amount,
          contentType: "pos:orders",
          contentTypeId: activeOrderId,
          customerId: customer?._id || "empty",
          customerType: customerType || "customer",
          description: `${activeOrderId} - ${orderNumber}`,
          paymentIds: paymentIds,
          data: { posToken: config?.token },
        },
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <Loader />

  if (!invoiceUrl) return <div></div>

  return <iframe src={invoiceUrl} className="min-h-full relative z-10" />
}

export default memo(MobileSheet)
