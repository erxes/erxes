import { useEffect, useState } from "react"
import clientMain from "@/modules/apolloClientMain"
import { mutations } from "@/modules/checkout/graphql"
import { currentAmountAtom } from "@/store"
import { configAtom } from "@/store/config.store"
import {
  activeOrderIdAtom,
  customerAtom,
  customerTypeAtom,
  orderNumberAtom,
} from "@/store/order.store"
import { useMutation } from "@apollo/client"
import { useAtomValue } from "jotai"

import Loader from "@/components/ui/loader"
import { onError } from "@/components/ui/use-toast"

const MobileSheet = () => {
  const [loading, setLoading] = useState(true)
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null)

  const config = useAtomValue(configAtom)
  const amount = useAtomValue(currentAmountAtom)
  const activeOrderId = useAtomValue(activeOrderIdAtom)
  const customer = useAtomValue(customerAtom)
  const customerType = useAtomValue(customerTypeAtom)
  const orderNumber = useAtomValue(orderNumberAtom)

  const [generateInvoiceUrl] = useMutation(mutations.generateInvoiceUrl, {
    context: {
      headers: { "erxes-app-token": config?.erxesAppToken },
    },
    client: clientMain,
    onError(error) {
      onError(error.message)
      setLoading(false)
    },
  })

  // 🔥 generate invoice + set iframe URL
  useEffect(() => {
    const run = async () => {
      try {
        console.log("🔥 Generating invoice...")

        const res = await generateInvoiceUrl({
          variables: {
            input: {
              amount,
              contentType: "pos:orders",
              contentTypeId: activeOrderId,
              customerId: customer?._id || "empty",
              customerType: customerType || "customer",
              description:
                orderNumber + "-" + config?.name + "-" + activeOrderId,
              paymentIds: config?.paymentIds,
              data: {
                posToken: config?.token,
              },
            },
          },
        })

        const url = res?.data?.generateInvoiceUrl

        console.log("✅ Invoice URL:", url)

        if (!url) {
          console.error("❌ No invoice URL returned")
          setLoading(false)
          return
        }

        // ✅ IMPORTANT: use iframe instead of redirect
        setInvoiceUrl(`http://localhost:4200${url}`)
        setLoading(false)
      } catch (err) {
        console.error("❌ Error generating invoice:", err)
        setLoading(false)
      }
    }

    run()
  }, [])

  //  listen for postMessage from widget
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      console.log("📩 RECEIVED:", event.data)

      if (event.data?.message === "paymentSuccessful") {
        alert("✅ Payment success (POS)")
      }
    }

    window.addEventListener("message", handler)

    return () => window.removeEventListener("message", handler)
  }, [])

  // UI states
  if (loading) return <Loader />

  if (!invoiceUrl) return <div>Failed to load payment</div>

  return <iframe src={invoiceUrl} className="w-full h-full border-0" />
}

export default MobileSheet
