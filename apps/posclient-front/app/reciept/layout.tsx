"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ThermalPaperWidthApplier from "@/modules/settings/components/thermalPaperWidthApplier"
import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"

import { cn } from "@/lib/utils"

const PrintFrame = ({ children }: { children: React.ReactNode }) => {
  const mode = useAtomValue(modeAtom)
  const embedded = useSearchParams().get("embed") === "1"

  return (
    <div
      className={cn(
        embedded &&
          "flex min-h-svh justify-center bg-sidebar px-4 py-6 print:block print:min-h-0 print:bg-white print:p-0"
      )}
    >
      <ThermalPaperWidthApplier />
      <div
        className={cn(
          "relative m-2 w-[var(--thermal-preview-paper-width)] overflow-y-auto rounded-lg border bg-card p-2 text-[12px] font-normal leading-[1.45] text-card-foreground shadow-xs print:m-0 print:h-auto print:min-h-0 print:w-full print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:bg-white print:p-0 print:text-black print:shadow-none print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]",
          mode === "mobile" && "w-auto print:w-full",
          embedded && "m-0 h-fit border-0 p-4 shadow-sm"
        )}
      >
        {children}
      </div>
    </div>
  )
}

const PrintLayout = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>
    <PrintFrame>{children}</PrintFrame>
  </Suspense>
)

export default PrintLayout
