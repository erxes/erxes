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
  
  useEffect(() => {
    return () => {
      clearAllTimers()
    }
  }, [])
  
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
    printWindow.document.open()
    // Keep document.write - it's the standard way for print windows
    printWindow.document.write(content)
    printWindow.document.close()
  }

  const addPrintEventListeners = (printWindow: Window) => {
    const handleAfterPrint = () => {
      printWindow.close()
      setPrintOpen(false)
    }
    
    const handleBeforePrint = () => {
      setPrintOpen(true)
    }

    printWindow.addEventListener('afterprint', handleAfterPrint)
    printWindow.addEventListener('beforeprint', handleBeforePrint)
  }

  const schedulePrintActions = (printWindow: Window) => {
    addTimer(() => {
      safeWindowOperation(printWindow, () => printWindow.print(), 'Initial print')
    }, 200)

    addTimer(() => {
      safeWindowOperation(printWindow, () => {
        printWindow.print()
        addTimer(() => {
          safeWindowOperation(printWindow, () => printWindow.close(), 'Closing print window')
        }, 500)
      }, 'Fallback print')
    }, 2000)
  }

  const handleWindowLoad = (printWindow: Window) => {
    safeWindowOperation(printWindow, () => addPrintEventListeners(printWindow), 'Adding print event listeners')
    schedulePrintActions(printWindow)
  }
  
  const printDocument = (printRef: React.RefObject<HTMLDivElement>) => {
    clearAllTimers()
    
    if (!printRef.current) {
      console.error('Print reference is not available')
      return { success: false, error: 'Print content is not ready. Please try again.' }
    }
    
    try {
      const printWindow = window.open('', '_blank')
      
      if (!printWindow) {
        console.error('Failed to open print window - popup may be blocked')
        return { success: false, error: 'Print window was blocked. Please allow popups for this site and try again.' }
      }
      
      const originalContent = printRef.current.innerHTML
      const contentWithVariables = replaceTemplateVariables(originalContent, {
        userName,
        userBankAddress
      })
      const printDocumentContent = createPrintDocument(contentWithVariables)
      
      setupPrintWindow(printWindow, printDocumentContent)
      printWindow.addEventListener('load', () => handleWindowLoad(printWindow))
      
      return { success: true, error: null }
    } catch (error) {
      console.error('Print failed:', error)
      setPrintOpen(false)
      return { success: false, error: 'Print failed. Please try again.' }
    }
  }
  
  return {
    printDocument,
    clearTimers: clearAllTimers
  }
}