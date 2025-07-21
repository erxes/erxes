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
import React, { useRef, useState, useEffect } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { printModalOpenAtom, userBankAddressAtom, userNameAtom } from "@/store"
import UserInfoForm from "./userInfoForm"

const PRINT_STYLES = `
  body {
    font-family: Arial, sans-serif;
    margin: 20px;
    color: black;
    line-height: 1.6;
  }
  .bg-gray-50 {
    background-color: #f9f9f9;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  .grid {
    display: grid;
    gap: 16px;
  }
  .grid-cols-2 {
    grid-template-columns: 1fr 1fr;
  }
  .border-b-2 {
    border-bottom: 2px solid #d1d5db;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .border-t {
    border-top: 1px solid #d1d5db;
    padding-top: 16px;
    margin-top: 32px;
  }
  .space-y-2 > * + * {
    margin-top: 8px;
  }
  .font-semibold {
    font-weight: 600;
  }
  .font-bold {
    font-weight: 700;
  }
  .text-center {
    text-align: center;
  }
  .text-sm {
    font-size: 14px;
  }
  .text-gray-600 {
    color: #6b7280;
  }
  .text-gray-700 {
    color: #374151;
  }
  .mb-2 {
    margin-bottom: 8px;
  }
  .mb-4 {
    margin-bottom: 16px;
  }
  .mb-6 {
    margin-bottom: 24px;
  }
  .ml-2 {
    margin-left: 8px;
  }
  .mt-8 {
    margin-top: 32px;
  }
  .pt-4 {
    padding-top: 16px;
  }
  .p-4 {
    padding: 16px;
  }
  .p-6 {
    padding: 24px;
  }
  .pb-4 {
    padding-bottom: 16px;
  }
  .max-w-2xl {
    max-width: 672px;
  }
  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }
  .rounded-lg {
    border-radius: 8px;
  }
  @media print {
    body {
      margin: 0;
    }
    .bg-gray-50 {
      background-color: #f5f5f5 !important;
    }
  }
`

const replaceTemplateVariables = (content: string, variables: Record<string, string>): string => {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    const pattern = new RegExp(`{{${key}}}`, 'g')
    return acc.replace(pattern, value || "N/A")
  }, content)
}

const createPrintDocument = (content: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${PRINT_STYLES}</style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `
}

const usePrintDocument = () => {
  const userName = useAtomValue(userNameAtom)
  const userBankAddress = useAtomValue(userBankAddressAtom)
  const setPrintOpen = useSetAtom(printModalOpenAtom)

  const printDocument = (printRef: React.RefObject<HTMLDivElement>) => {
    if (!printRef.current) {
      console.error('Print reference is not available')
      alert('Print content is not ready. Please try again.')
      return false
    }

    try {
      const printWindow = window.open('', '_blank')
      
      if (!printWindow) {
        console.error('Failed to open print window - popup may be blocked')
        alert('Print window was blocked. Please allow popups for this site and try again.')
        return false
      }

      const originalContent = printRef.current.innerHTML
      const contentWithVariables = replaceTemplateVariables(originalContent, {
        userName,
        userBankAddress
      })
      
      const printDocumentContent = createPrintDocument(contentWithVariables)
      printWindow.document.open()
      printWindow.document.write(printDocumentContent)
      printWindow.document.close()

      const handleAfterPrint = () => {
        printWindow.close()
        setPrintOpen(false)
      }

      const handleBeforePrint = () => {
        setPrintOpen(true)
      }

      printWindow.addEventListener('load', () => {
        printWindow.addEventListener('afterprint', handleAfterPrint)
        printWindow.addEventListener('beforeprint', handleBeforePrint)
        
        setTimeout(() => {
          printWindow.print()
        }, 200)
      })

      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          try {
            printWindow.print()
          } catch (e) {
            console.error('Fallback print failed:', e)
          }
          setTimeout(() => {
            try {
              printWindow.close()
            } catch (e) {
              console.error('Failed to close print window:', e)
            }
          }, 500)
        }
      }, 2000)

      return true
    } catch (error) {
      console.error('Print failed:', error)
      alert('Print failed. Please try again.')
      setPrintOpen(false)
      return false
    }
  }

  return { printDocument }
}

const SelectPaymentTypeMain = () => {
  const [showUserForm, setShowUserForm] = useState(false)
  const [shouldShowPrintable, setShouldShowPrintable] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  
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

  const resetPrintStates = () => {
    setShowUserForm(false)
    setShouldShowPrintable(false)
    setIsPrinting(false)
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    
    try {
      const success = printDocument(printRef)
      if (success) {
        setTimeout(() => {
          resetPrintStates()
        }, 500)
      } else {
        setIsPrinting(false)
      }
    } catch (error) {
      console.error('Print error:', error)
      setIsPrinting(false)
    }
  }

  const handlePrintClick = () => {
    resetPrintStates()
    
    setTimeout(() => {
      setShouldShowPrintable(true)
      setShowUserForm(true)
    }, 50)
  }

  const handleCancelPrint = () => {
    resetPrintStates()
  }

  useEffect(() => {
    return () => {
      resetPrintStates()
    }
  }, [])

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
          onClick={handlePrintClick}
          disabled={disabledTerms || isPrinting}
        >
          <span className="flex items-center">
            <CoinsIcon className="mr-2" /> 
            {isPrinting ? "Printing..." : "Nehemjleh"}
          </span>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {showUserForm && (
        <UserInfoForm
          onSubmit={handlePrint}
          onCancel={handleCancelPrint}
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