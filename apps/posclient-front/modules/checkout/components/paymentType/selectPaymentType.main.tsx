"use client"

import React, { useRef } from "react"
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

import { useInvoicePrintSupplement } from "../../hooks/useInvoicePrintSupplement"
import usePaymentLabel from "../../hooks/usePaymentLabel"
import { usePaymentStates } from "../../hooks/usePaymentStates"
import { useCheckNotSplit } from "../../hooks/usePaymentType"
import usePossiblePaymentTerms from "../../hooks/usePossiblePaymentTerms"
import UserInfoForm from "./invoiceInfoForm"
import PrintableSupplement from "./supplement"

const SelectPaymentTypeMain = () => {
  const {
    showUserForm,
    shouldShowPrintable,
    error,
    startPrint,
    cancelPrint,
    handlePrintStart,
    handlePrintSuccess,
    handlePrintError,
  } = usePaymentStates()

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
  const { printDocument } = useInvoicePrintSupplement()

  const printRef = useRef<HTMLDivElement>(null)
  const hasPrintInvoice = mappedPts.some(
    (payment) => Boolean(payment.config?.printInvoice)
  )

  const handlePrint = async () => {
    handlePrintStart()

    try {
      const result = printDocument(printRef)
      if (result.success) {
        handlePrintSuccess()
      } else {
        handlePrintError(result.error || "Unknown error occurred")
      }
    } catch (error) {
      console.error("Print error:", error)
      handlePrintError("Unexpected error occurred during printing")
    }
  }

  return (
    <>
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
            invoice={Boolean(payment.config?.printInvoice)}
            onPrint={startPrint}
          />
        ))}

        {(shouldShowPrintable || hasPrintInvoice) && (
          <div
            style={{ display: "none", position: "absolute", left: "-9999px" }}
          >
            <PrintableSupplement ref={printRef} />
          </div>
        )}
      </div>

      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}

      {showUserForm && (
        <UserInfoForm onSubmit={handlePrint} onCancel={cancelPrint} />
      )}
    </>
  )
}

const Term = ({
  Icon,
  title,
  type,
  disabled,
  invoice,
  onPrint,
}: {
  Icon: LucideIcon
  title: string
  type: string
  disabled?: boolean
  invoice?: boolean
  onPrint?: () => void
}) => {
  const { handleSetType } = useCheckNotSplit()

  const handleClick = () => {
    if (invoice && onPrint) {
      onPrint()
    } else {
      handleSetType(type)
    }
  }

  return (
    <Button
      variant="secondary"
      className="flex items-center bg-transparent text-white p-4 font-semibold text-sm rounded-lg border border-slate-500 h-auto hover:bg-secondary/10 justify-between"
      onClick={handleClick}
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