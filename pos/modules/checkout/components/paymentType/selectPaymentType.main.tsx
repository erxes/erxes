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
import PrintableSupplement from "./supplement"
import React, { useRef } from "react"
import UserInfoForm from "./userInfoForm"
import { usePaymentStates } from "../../hooks/usePaymentStates"
import { usePrintDocument } from "../../hooks/usePrintSupplement"

const SelectPaymentTypeMain = () => {
  const {
    showUserForm,
    shouldShowPrintable,
    isPrinting,
    error,
    startPrint,
    cancelPrint,
    handlePrintStart,
    handlePrintSuccess,
    handlePrintError
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
  const { printDocument } = usePrintDocument()
  
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = async () => {
    handlePrintStart()
    
    try {
      const result = printDocument(printRef)
      if (result.success) {
        handlePrintSuccess()
      } else {
        handlePrintError(result.error || 'Unknown error occurred')
      }
    } catch (error) {
      console.error('Print error:', error)
      handlePrintError('Unexpected error occurred during printing')
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
          />
        ))}

        {/* Only render the printable component when actually needed */}
        {shouldShowPrintable && (
          <div style={{ display: "none", position: "absolute", left: "-9999px" }}>
            <PrintableSupplement ref={printRef} />
          </div>
        )}
        
        <Button
          variant="secondary"
          className="flex items-center bg-transparent text-white p-4 font-semibold text-sm rounded-lg border border-slate-500 h-auto hover:bg-secondary/10 justify-between"
          onClick={startPrint}
          disabled={disabledTerms || isPrinting}
        >
          <span className="flex items-center">
            <CoinsIcon className="mr-2" /> 
            {isPrinting ? "Printing..." : "Nehemjleh"}
          </span>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {error && (
        <div className="text-red-500 mt-2 text-sm">
          {error}
        </div>
      )}

      {showUserForm && (
        <UserInfoForm
          onSubmit={handlePrint}
          onCancel={cancelPrint}
        />
      )}
    </>
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