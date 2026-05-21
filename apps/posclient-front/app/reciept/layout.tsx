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
          "m-2 w-[var(--thermal-preview-paper-width)] relative overflow-y-auto min-h-screen space-y-1 border-b p-2 pb-16 text-[12px] font-normal leading-[1.45] text-black shadow-lg print:m-0 print:h-auto print:min-h-0 print:w-full print:max-w-none print:overflow-visible print:p-0 print:shadow-none print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]",
          mode === "mobile" && "w-auto print:w-full"
        )}
      >
        {children}
      </div>
    </>
  )
}

export default PrintLayout
