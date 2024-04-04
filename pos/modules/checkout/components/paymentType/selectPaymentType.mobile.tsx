import { useEffect } from "react"
import useConfig from "@/modules/auth/hooks/useConfig"
import { checkoutModalViewAtom } from "@/store"
import { useSetAtom } from "jotai"
import { CoinsIcon, SmartphoneNfcIcon, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Loader from "@/components/ui/loader"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import useHandlePayment from "../../hooks/useHandlePayment"
import { useCheckNotSplit } from "../../hooks/usePaymentType"
import usePossiblePaymentTerms from "../../hooks/usePossiblePaymentTerms"

const SelectPaymentType = () => {
  const { paymentIds, mappedPts } = usePossiblePaymentTerms()

  const { notPaidAmount, setCurrentAmount } = useHandlePayment()

  const { handleSetType, currentPaymentType } = useCheckNotSplit()
  const setView = useSetAtom(checkoutModalViewAtom)

  useEffect(() => {
    setCurrentAmount(notPaidAmount)
  }, [notPaidAmount, setCurrentAmount])

  const { loading } = useConfig("payment")

  return (
    <div className="p-2">
      <h2 className="text-base font-semibold mb-4 text-center">
        Төлбөрийн хэрэгсэлээ сонгоно уу!
      </h2>
      {loading ? (
        <Loader className="min-h-[15rem]" />
      ) : (
        <div className="min-h-[15rem]">
          <RadioGroup
            className="pb-2 grid grid-cols-2 gap-2"
            value={currentPaymentType}
            onValueChange={(value) => {
              handleSetType(value)
              setView("paymentValue")
            }}
          >
            <PaymentType type="cash">
              <Wallet />
              Бэлнээр
            </PaymentType>
            {!!paymentIds?.length && (
              <PaymentType type="mobile">
                <SmartphoneNfcIcon />
                Цахимаар
              </PaymentType>
            )}

            {mappedPts.map((payment) => (
              <PaymentType type={payment.type} key={payment.type}>
                <CoinsIcon />
                {payment.title}
              </PaymentType>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  )
}

const PaymentType = ({
  type,
  children,
}: {
  type: string
  children: React.ReactNode
}) => {
  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full h-20 text-base font-bold capitalize justify-start relative"
      Component={"div"}
    >
      <RadioGroupItem
        value={type}
        id={type}
        className="absolute top-1/2 left-4 -translate-y-1/2"
      />
      <Label
        htmlFor={type}
        className="absolute inset-0 flex items-center justify-start pl-11 [&>svg]:h-6 [&>svg]:w-6 [&>svg]:mr-2"
      >
        {children}
      </Label>
    </Button>
  )
}

export default SelectPaymentType
