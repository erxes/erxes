import { useEffect } from "react"
import clientMain from "@/modules/apolloClientMain"
import { paymentConfigAtom } from "@/store/config.store"
import {
  activeOrderAtom,
  customerAtom,
  customerTypeAtom,
  mobileAmountAtom,
} from "@/store/order.store"
import { gql, useLazyQuery, useMutation } from "@apollo/client"
import { useAtom } from "jotai"

import { useToast } from "@/components/ui/use-toast"

import { mutations, queries } from "../graphql"

const useMobilePayment = ({
  onCompleted,
  amount,
}: {
  onCompleted?: (paidAmount: number) => void
  amount?: number
}) => {
  const [config] = useAtom(paymentConfigAtom)
  const [activeOrder] = useAtom(activeOrderAtom)
  const [mobileAmount] = useAtom(mobileAmountAtom)
  const [customer] = useAtom(customerAtom)
  const [customerType] = useAtom(customerTypeAtom)

  const { erxesAppToken, paymentIds } = config || {}

  const { onError } = useToast()

  const [generateInvoiceUrl, { loading, data }] = useMutation(
    gql(mutations.generateInvoiceUrl),
    {
      client: clientMain,
      onError,
    }
  )

  const invoiceUrl = (data || {}).generateInvoiceUrl || ""

  const [getInvoices] = useLazyQuery(gql(queries.invoices), {
    client: clientMain,
    context: { headers: { "erxes-app-token": erxesAppToken } },
    variables: {
      contentType: "pos:orders",
      contentTypeId: activeOrder,
    },
    fetchPolicy: "network-only",
    onCompleted(data) {
      const invoices = (data || {}).invoices || []

      const paidAmount = invoices
        .filter(({ status }: any) => status === "paid")
        .reduce((total: number, { amount }: any) => total + amount, 0)

      if (paidAmount > mobileAmount) {
        return !!onCompleted && onCompleted(paidAmount)
      }

      generateInvoiceUrl({
        variables: {
          amount,
          contentType: "pos:orders",
          contentTypeId: activeOrder,
          customerId: customer?._id || "empty",
          customerType: customerType || "customer",
          description: activeOrder,
          paymentIds: paymentIds,
        },
      })
    },
  })

  useEffect(() => {
    window.addEventListener("message", (event) => {
      const { message, fromPayment } = event.data
      if (fromPayment) {
        if (message === "paymentSuccessfull") {
          getInvoices()
        }
      }
    })

    getInvoices()

    return removeEventListener("message", () => {})
  }, [getInvoices])

  return { invoiceUrl, loading }
}

export default useMobilePayment
