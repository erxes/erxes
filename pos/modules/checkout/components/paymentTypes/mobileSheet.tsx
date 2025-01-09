import Loader from "@/components/ui/loader"
import { onError } from "@/components/ui/use-toast"
import clientMain from '@/modules/apolloClientMain'
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
import { useEffect, useState } from "react"

const MobileSheet = () => {
  const [loading, setLoading] = useState(true)
  const config = useAtomValue(configAtom)
  const amount = useAtomValue(currentAmountAtom)
  const activeOrderId = useAtomValue(activeOrderIdAtom)
  const customer = useAtomValue(customerAtom)
  const customerType = useAtomValue(customerTypeAtom)
  const orderNumber = useAtomValue(orderNumberAtom)

  const [generateInvoiceUrl, { data }] = useMutation(
    mutations.generateInvoiceUrl,
    {
      context: {
        headers: { 'erxes-app-token': config?.erxesAppToken }
      },
      client: clientMain,
      onError(error) {
        onError(error.message)
      },
    }
  )
  useEffect(() => {
    generateInvoiceUrl({
      variables: {
        amount,
        contentType: "pos:orders",
        contentTypeId: activeOrderId,
        customerId: customer?._id ? customer?._id : "empty",
        customerType: customerType || "customer",
        description: orderNumber + "-" + config?.name + "-" + activeOrderId,
        paymentIds: config?.paymentIds,
        data: {
          posToken: config?.token,
        },
      },
      onCompleted() {
        setLoading(false)
      },
    })
  }, [])

  if (loading) {
    return <Loader />
  }

  return <iframe src={data?.generateInvoiceUrl} className="w-full h-full" />
}

export default MobileSheet
