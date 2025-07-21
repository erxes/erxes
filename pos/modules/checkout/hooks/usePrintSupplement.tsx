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

        addTimer(() => {
          printWindow.print()
        }, 200)
      })

      addTimer(() => {
        if (printWindow && !printWindow.closed) {
          try {
            printWindow.print()
          } catch (e) {
            console.error('Fallback print failed:', e)
          }
          
          addTimer(() => {
            try {
              printWindow.close()
            } catch (e) {
              console.error('Failed to close print window:', e)
            }
          }, 500)
        }
      }, 2000)

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