"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { currentPaymentTypeAtom } from "@/store"
import { useSetAtom } from "jotai"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const Layout = ({ children }: { children: React.ReactNode }) => {
  const setActiveType = useSetAtom(currentPaymentTypeAtom)
  const router = useRouter()
  const mainOrder = useSearchParams().get("mainOrder")
  return (
    <div className="relative flex flex-auto items-center justify-center bg-muted/60 p-4">
      <Button
        variant="ghost"
        size={"sm"}
        className="absolute right-4 top-4 h-8 w-8 rounded-full px-0"
        aria-label="Хаах"
        onClick={() => {
          mainOrder
            ? router.push(`/checkout?orderId=${mainOrder}`)
            : router.push("/")
          setActiveType("")
        }}
      >
        <X className="w-5 h-5" />
      </Button>
      <ScrollArea>{children}</ScrollArea>
    </div>
  )
}

export default Layout
