"use client"

import {
  ChevronRight,
  CoinsIcon,
  LandmarkIcon,
  LucideIcon,
  SmartphoneNfcIcon,
  Wallet,
} from "lucide-react"

import { BANK_CARD_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"

import usePaymentLabel from "../../hooks/usePaymentLabel"
import { useCheckNotSplit } from "../../hooks/usePaymentType"
import usePossiblePaymentTerms from "../../hooks/usePossiblePaymentTerms"

const SelectPaymentTypeMain = () => {
  const {
    loadingKhan,
    disabledTerms,
    paymentIds,
    khan,
    tdb,
    capitron,
    golomt,
    mappedPts,
    notPaidAmount,
  } = usePossiblePaymentTerms()

  const { getLabel } = usePaymentLabel()

  return (
    <div className="grid grid-cols-2 gap-2">
      <Term
        Icon={Wallet}
        title="Бэлнээр"
        type="cash"
        disabled={disabledTerms}
      />
      {!!paymentIds?.length && (
        <Term
          Icon={SmartphoneNfcIcon}
          title="Цахимаар"
          type="mobile"
          disabled={disabledTerms || !notPaidAmount}
        />
      )}
      {!!khan && (
        <Term
          Icon={LandmarkIcon}
          title="Хаан банк"
          type={BANK_CARD_TYPES.KHANBANK}
          disabled={disabledTerms || !notPaidAmount}
        />
      )}
      {!!tdb && (
        <Term
          Icon={LandmarkIcon}
          title={getLabel(tdb.type)}
          type={tdb.type}
          disabled={disabledTerms || !notPaidAmount}
        />
      )}
      {!!capitron && (
        <Term
          Icon={LandmarkIcon}
          title={getLabel(capitron.type)}
          type={capitron.type}
          disabled={disabledTerms || !notPaidAmount}
        />
      )}
      {!!golomt && (
        <Term
          Icon={LandmarkIcon}
          title="Голомт банк"
          type={BANK_CARD_TYPES.GOLOMT}
          disabled={disabledTerms || !notPaidAmount}
        />
      )}
      {mappedPts.map((payment) => (
        <Term
          Icon={CoinsIcon}
          title={payment.title}
          type={payment.type}
          key={payment.type}
          disabled={payment.disabled || disabledTerms}
        />
      ))}
    </div>
  )
}

const Term = ({
  Icon,
  title,
  type,
  disabled,
}: {
  Icon: LucideIcon
  title: string
  type: string
  disabled?: boolean
}) => {
  const { handleSetType } = useCheckNotSplit()

  return (
    <Button
      variant="secondary"
      className="flex items-center bg-transparent text-white p-4 font-semibold text-sm rounded-lg border border-slate-500 h-auto hover:bg-secondary/10 justify-between"
      onClick={() => handleSetType(type)}
      disabled={disabled}
    >
      <span className="flex items-center">
        <Icon className="mr-2" /> {title}
      </span>
      <ChevronRight className="h-5 w-5" />
    </Button>
  )
}

export default SelectPaymentTypeMain
