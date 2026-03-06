import { useState, useEffect, useCallback } from "react"
import { useAtomValue } from "jotai"
import { activeOrderIdAtom, orderTotalAmountAtom } from "@/store/order.store"
import useAddPayment from "./useAddPayment"

export const usePaymentStates = () => {
  const [showUserForm, setShowUserForm] = useState(false)
  const [shouldShowPrintable, setShouldShowPrintable] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const activeOrderId = useAtomValue(activeOrderIdAtom)
  const orderTotalAmount = useAtomValue(orderTotalAmountAtom)
  const { addPayment } = useAddPayment()

  const resetStates = useCallback(() => {
    setShowUserForm(false)
    setShouldShowPrintable(false)
    setIsPrinting(false)
    setError(null)
  }, [])

  const startPrint = useCallback(() => {
    resetStates()
    setTimeout(() => {
      setShouldShowPrintable(true)
      setShowUserForm(true)
    }, 50)
  }, [resetStates])

  const handlePrintStart = useCallback(() => {
    setIsPrinting(true)
    setError(null)
  }, [])

  const handlePrintSuccess = useCallback(() => {
    if (activeOrderId && orderTotalAmount > 0) {
      addPayment({
        variables: {
          _id: activeOrderId,
          cashAmount: orderTotalAmount
        }
      })
    }
    
    setTimeout(() => {
      resetStates()
    }, 500)
  }, [resetStates, activeOrderId, orderTotalAmount, addPayment])

  const handlePrintError = useCallback((errorMessage: string) => {
    setError(errorMessage)
    setIsPrinting(false)
  }, [])

  const cancelPrint = useCallback(() => {
    resetStates()
  }, [resetStates])

  useEffect(() => {
    return () => {
      resetStates()
    }
  }, [resetStates])

  return {
    // States
    showUserForm,
    shouldShowPrintable,
    isPrinting,
    error,
    // Actions
    startPrint,
    cancelPrint,
    handlePrintStart,
    handlePrintSuccess,
    handlePrintError,
    resetStates
  }
}