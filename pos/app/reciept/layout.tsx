"use client"

import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"

import { cn } from "@/lib/utils"

const PrintLayout = ({ children }: { children: React.ReactNode }) => {
  const mode = useAtomValue(modeAtom)

  return (
    <div
      className={cn(
        "m-2 w-[72mm] space-y-1 p-1 pb-4 text-[10px] font-light shadow-lg print:m-0 print:pb-1 print:shadow-none border-b",
        mode === "mobile" &&
          "w-auto print:w-[72mm] font-normal print:font-light"
      )}
    >
      {children}
    </div>
  )
}

export default PrintLayout
