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
  const hasPrintInvoice = mappedPts.some((payment) =>
    Boolean(payment.config?.printInvoice)
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
      <div className="grid grid-cols-2 gap-3">
        <Term
          Icon={Wallet}
          title="Бэлнээр"
          type="cash"
          disabled={disabledTerms || !notPaidAmount}
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

      {error && <div className="mt-3 text-sm text-destructive">{error}</div>}

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
      variant="outline"
      className="group h-auto justify-between gap-3 rounded-xl bg-background p-3 text-sm font-semibold shadow-xs transition-colors hover:border-primary/40 hover:bg-primary/5"
      onClick={handleClick}
      disabled={disabled}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="truncate">{title}</span>
      </span>
      <ChevronRight className="h-4 w-4 flex-none text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Button>
  )
}

export default SelectPaymentTypeMain
