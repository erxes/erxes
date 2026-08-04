"use client"

import ThermalPaperWidthApplier from "@/modules/settings/components/thermalPaperWidthApplier"
import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"

import { cn } from "@/lib/utils"

const PrintLayout = ({ children }: { children: React.ReactNode }) => {
  const mode = useAtomValue(modeAtom)

  return (
    <>
      <ThermalPaperWidthApplier />
      <div
        className={cn(
          "relative m-2 w-[var(--thermal-preview-paper-width)] overflow-y-auto rounded-lg border bg-card p-2 text-[12px] font-normal leading-[1.45] text-card-foreground shadow-sm print:m-0 print:h-auto print:min-h-0 print:w-full print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:bg-white print:p-0 print:text-black print:shadow-none print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]",
          mode === "mobile" && "w-auto print:w-full"
        )}
      >
        {children}
      </div>
    </>
  )
}

export default PrintLayout
