import { useEffect, useState } from "react"
import clientMain from "@/modules/apolloClientMain"
import { queries } from "@/modules/orders/graphql"
import { currentAmountAtom, invoiceIdAtom, paymentDataAtom } from "@/store"
import { configAtom, coverConfigAtom } from "@/store/config.store"
import {
  activeOrderIdAtom,
  customerAtom,
  customerTypeAtom,
  orderNumberAtom,
} from "@/store/order.store"
import { useMutation, useQuery } from "@apollo/client"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { ShieldAlert } from "lucide-react"

import { IPaymentOption } from "@/types/payment.types"
import { INSTRUCTIONS } from "@/lib/constants"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import Loader from "@/components/ui/loader"
import { RadioGroup } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"

import { mutations } from "../../graphql"
import PaymentType from "./paymentType"
import PhoneNumber from "./phoneNumber"
import QrDetail from "./QrDetail"

const MobileSheet = () => {
  const config = useAtomValue(configAtom)
  const context = {
    headers: {
      "erxes-app-token": config?.erxesAppToken,
    },
  }
  const { data, loading, error } = useQuery(queries.payment, {
    client: clientMain,
    context,
  })

  const coverConfig = useAtomValue(coverConfigAtom)

  const [createInvoice, { reset, data: invoiceData, loading: loadingInvoice }] =
    useMutation(mutations.createInvoice, {
      client: clientMain,
      context,
    })

  const [checkInvoice, { loading: loadingCheck }] = useMutation(
    mutations.checkInvoice
  )

  const amount = useAtomValue(currentAmountAtom)
  const activeOrderId = useAtomValue(activeOrderIdAtom)
  const [invoiceId, setInvoiceId] = useAtom(invoiceIdAtom)
  const customer = useAtomValue(customerAtom)
  const customerType = useAtomValue(customerTypeAtom)
  const orderNumber = useAtomValue(orderNumberAtom)
  const setPaymentData = useSetAtom(paymentDataAtom)
  const [selected, setSelected] = useState("")
  const { onError } = useToast()

  const { payments: allPayments } = data || {}
  const { errorDescription, status, apiResponse, idOfProvider } =
    invoiceData?.invoiceCreate || {}

  const QR_PAYMENTS = ["qpay", "monpay", "pocket", "qpayQuickqr"]
  const PHONE_PAYMENTS = ["socialpay", "storepay"]

  const payments = (allPayments || []).filter((pm: IPaymentOption) =>
    coverConfig?.paymentIds.includes(pm._id)
  )

  const getKindById = (_id: string) =>
    payments?.find((p: IPaymentOption) => p._id === _id)?.kind

  const handleCreateInvoice = ({
    id,
    phone,
  }: {
    id: string
    phone?: string
  }) => {
    createInvoice({
      variables: {
        amount,
        contentType: "pos:orders",
        contentTypeId: activeOrderId,
        customerId: customer?._id || "empty",
        customerType: customerType || "customer",
        description: `${activeOrderId} - ${orderNumber}`,
        data: { posToken: config?.token },
        selectedPaymentId: id,
        phone,
      },
      onCompleted: (data) => {
        const { _id, apiResponse } = data?.invoiceCreate || {}
        const { qrData } = apiResponse || {}
        setInvoiceId(_id)
        if (qrData) {
          setPaymentData({
            kind: getKindById(id),
            qrData,
            amount,
          })
        }
      },
      onError,
    })
  }

  const handleValueChange = (value: string) => {
    setSelected(value)

    const selectedKind = getKindById(value)

    setPaymentData(null)
    reset()

    if (QR_PAYMENTS.includes(selectedKind))
      return handleCreateInvoice({ id: value })
  }

  useEffect(() => {
    return () => {
      setPaymentData(null)
      setInvoiceId(null)
    }
  }, [])

  if (loading) return <Loader />
  return (
    <div>
      <h1 className="font-bold text-lg mb-4 pb-1 border-b border-dashed">
        Цахимаар төлөх
      </h1>
      {!error && (
        <div className="text-black/60 mb-1">Төлбөрийн хэрэгслээ сонгоно уу</div>
      )}
      {!!error && <Error />}
      <RadioGroup
        className="grid grid-cols-2 gap-2 mb-6"
        value={selected}
        onValueChange={handleValueChange}
      >
        {(payments || []).map((p: IPaymentOption) => (
          <PaymentType {...p} key={p._id} selected={p._id === selected} />
        ))}
      </RadioGroup>

      {idOfProvider === "not supported" && (
        <div className="py-3">
          <Error />
        </div>
      )}

      {loadingInvoice && QR_PAYMENTS.includes(getKindById(selected)) && (
        <div className="relative">
          <AspectRatio ratio={2} />
          <Loader className="absolute inset-0" />
        </div>
      )}

      {!loadingInvoice &&
        (!!apiResponse?.qrData ||
          (QR_PAYMENTS.includes(getKindById(selected)) &&
            (errorDescription || apiResponse?.error))) && (
          <QrDetail
            errorDescription={errorDescription || apiResponse?.error}
            status={status}
            qrCode={apiResponse?.qrData}
          />
        )}

      {PHONE_PAYMENTS.includes(getKindById(selected)) && (
        <PhoneNumber
          loading={loadingInvoice}
          handleSubmit={handleCreateInvoice}
          _id={selected}
          error={errorDescription || apiResponse?.error}
        />
      )}

      {invoiceId && (
        <div className="mt-4 text-center">
          <Button
            variant="secondary"
            size="lg"
            className="font-medium px-8"
            loading={loadingCheck}
            onClick={() => checkInvoice({ variables: { id: invoiceId } })}
          >
            Төлөлт шалгах
          </Button>
        </div>
      )}
    </div>
  )
}

const Error = () => (
  <Alert variant="destructive">
    <ShieldAlert className="h-4 w-4" />
    <AlertTitle className="font-semibold">
      Та erxes-app-token тохируулаагүй эсвэл erxes-app-token-ий эрх хүрэлцэхгүй
      байна
    </AlertTitle>
    <AlertDescription>Дараах зааврын дагуу тохируулана уу</AlertDescription>
    <div className="relative pb-[56.25%] h-0 mt-2 overflow-hidden rounded-lg">
      <iframe
        src={INSTRUCTIONS.PAYMENT_APP_TOKEN}
        frameBorder="0"
        allowFullScreen
        className="absolute top-0 left-0 h-full w-full"
      />
    </div>
  </Alert>
)

export default MobileSheet
