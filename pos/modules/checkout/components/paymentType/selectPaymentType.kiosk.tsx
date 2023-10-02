import { useEffect, useState } from "react"
import useConfig from "@/modules/auth/hooks/useConfig"
import { currentPaymentTypeAtom, kioskDialogOpenAtom } from "@/store"
import { useAtom, useSetAtom } from "jotai"

import { BANK_CARD_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { DialogContent } from "@/components/ui/dialog"
import Loader from "@/components/ui/loader"
import { RadioGroup } from "@/components/ui/radio-group"

import useHandlePayment from "../../hooks/useHandlePayment"
import usePossiblePaymentTerms from "../../hooks/usePossiblePaymentTerms"

const SelectPaymentType = () => {
  const { paymentIds, khan, tdb, golomt } = usePossiblePaymentTerms()

  const { notPaidAmount, setCurrentAmount } = useHandlePayment()

  useEffect(() => {
    setCurrentAmount(notPaidAmount)
  }, [notPaidAmount, setCurrentAmount])

  const { loading: loadingConfig } = useConfig("payment")

  return (
    <>
      <DialogContent className="bg-black text-white  sm:rounded-3xl">
        <h2 className="text-3xl font-black text-center">
          Төлбөрийн хэрэгсэлээ <br /> сонгоно уу!
        </h2>

        {loadingConfig ? (
          <Loader className="min-h-[15rem]" />
        ) : (
          <RadioGroup className="flex flex-col justify-center gap-4 pt-4 pb-8">
            {!!paymentIds?.length && (
              <PaymentType type="mobile">Цахимаар</PaymentType>
            )}
            {!!khan && (
              <PaymentType type={BANK_CARD_TYPES.KHANBANK}>Kартаар</PaymentType>
            )}
            {!!tdb && (
              <PaymentType type={BANK_CARD_TYPES.TDB}>Kартаар</PaymentType>
            )}
            {!!golomt && (
              <PaymentType type={BANK_CARD_TYPES.GOLOMT}>Kартаар</PaymentType>
            )}
          </RadioGroup>
        )}
      </DialogContent>
    </>
  )
}

const PaymentType = ({
  type,
  children,
}: {
  type: string
  children: React.ReactNode
}) => {
  const { handlePay, loading } = useHandlePayment()
  const [currentPaymentType, handleSetType] = useAtom(currentPaymentTypeAtom)
  const [shouldPay, setShouldPay] = useState(false)

  const setOpen = useSetAtom(kioskDialogOpenAtom)

  useEffect(() => {
    if (currentPaymentType && shouldPay) {
      setShouldPay(false)
      handlePay()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPay])

  const handleClick = () => {
    setOpen(false)
    handleSetType(type)
    setTimeout(handlePay)
    setShouldPay(true)
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full text-lg h-16 rounded-2xl hover:bg-white/10 hover:text-white"
      loading={loading}
      onClick={handleClick}
    >
      {children}
    </Button>
  )
}

export default SelectPaymentType
