"use client"

import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"

import { cn } from "@/lib/utils"

const PrintLayout = ({ children }: { children: React.ReactNode }) => {
  const mode = useAtomValue(modeAtom)

  return (
    <div
      className={cn(
        "m-2 w-[72mm] relative overflow-y-auto min-h-screen space-y-1 border-b p-2 pb-16 text-[12px] font-normal leading-[1.45] text-black shadow-lg print:m-0 print:h-auto print:overflow-visible print:pb-2 print:shadow-none print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]",
        mode === "mobile" && "w-auto print:w-[72mm]"
      )}
    >
      {children}
    </div>
  )
}

export default PrintLayout
