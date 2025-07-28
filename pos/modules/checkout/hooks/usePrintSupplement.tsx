import { useAtomValue, useSetAtom } from "jotai"
import { useRef, useEffect } from "react"
import { printModalOpenAtom, userBankAddressAtom, userNameAtom } from "@/store"
import { createPrintDocument, replaceTemplateVariables } from "../utils/printUtils"

export const usePrintDocument = () => {
  const userName = useAtomValue(userNameAtom)
  const userBankAddress = useAtomValue(userBankAddressAtom)
  const setPrintOpen = useSetAtom(printModalOpenAtom)
  
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set())
  
  const clearAllTimers = () => {
    timersRef.current.forEach(timer => clearTimeout(timer))
    timersRef.current.clear()
  }
  
  useEffect(() => clearAllTimers, [])
  
  const addTimer = (callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer)
      callback()
    }, delay)
    timersRef.current.add(timer)
    return timer
  }

  const safeWindowOperation = (printWindow: Window, operation: () => void, operationName: string) => {
    try {
      if (printWindow && !printWindow.closed) {
        operation()
      }
    } catch (error) {
      console.error(`${operationName} failed:`, error)
    }
  }

  const setupPrintWindow = (printWindow: Window, content: string) => {
    const doc = printWindow.document
    doc.open()
    doc.write(content)
    doc.close()
  }

  const handleAfterPrint = (printWindow: Window) => {
    printWindow.close()
    setPrintOpen(false)
  }
  
  const handleBeforePrint = () => {
    setPrintOpen(true)
  }

  const addPrintEventListeners = (printWindow: Window) => {
    printWindow.addEventListener('afterprint', () => handleAfterPrint(printWindow))
    printWindow.addEventListener('beforeprint', handleBeforePrint)
  }

  const doPrint = (printWindow: Window) => {
    safeWindowOperation(printWindow, () => printWindow.print(), 'Print operation')
  }

  const closeWindow = (printWindow: Window) => {
    safeWindowOperation(printWindow, () => printWindow.close(), 'Close window')
  }

  const schedulePrintActions = (printWindow: Window) => {
    addTimer(() => doPrint(printWindow), 200)
    
    addTimer(() => {
      doPrint(printWindow)
      addTimer(() => closeWindow(printWindow), 500)
    }, 2000)
  }

  const handleWindowReady = (printWindow: Window) => {
    safeWindowOperation(printWindow, () => addPrintEventListeners(printWindow), 'Add listeners')
    schedulePrintActions(printWindow)
  }

  const setupLoadHandler = (printWindow: Window) => {
    if (printWindow.document.readyState === 'complete') {
      handleWindowReady(printWindow)
      return
    }
    
    printWindow.addEventListener('load', () => handleWindowReady(printWindow))
  }
  
  const printDocument = (printRef: React.RefObject<HTMLDivElement>) => {
    clearAllTimers()
    
    if (!printRef.current) {
      console.error('Print reference is not available')
      return { success: false, error: 'Print content is not ready. Please try again.' }
    }
    
    const printWindow = window.open('', '_blank')
    
    if (!printWindow) {
      console.error('Failed to open print window - popup may be blocked')
      return { success: false, error: 'Print window was blocked. Please allow popups for this site and try again.' }
    }
    
    try {
      const originalContent = printRef.current.innerHTML
      const contentWithVariables = replaceTemplateVariables(originalContent, {
        userName,
        userBankAddress
      })
      const printDocumentContent = createPrintDocument(contentWithVariables)
      
      setupPrintWindow(printWindow, printDocumentContent)
      setupLoadHandler(printWindow)
      
      return { success: true, error: null }
    } catch (error) {
      console.error('Print failed:', error)
      setPrintOpen(false)
      printWindow.close()
      return { success: false, error: 'Print failed. Please try again.' }
    }
  }
  
  return {
    printDocument,
    clearTimers: clearAllTimers
  }
}