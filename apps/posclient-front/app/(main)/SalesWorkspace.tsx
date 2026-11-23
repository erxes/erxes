import { useState, type ReactNode } from "react"
import CheckoutMain from "@/modules/checkout/main"
import { cartAtom } from "@/store/cart.store"
import { orderNumberAtom, slotCodeAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const segmentClass =
  "h-8 rounded-md text-[13px] font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
const segmentActiveClass =
  "bg-background text-primary shadow-sm hover:bg-background hover:text-primary"

export function SalesWorkspace({ children }: { children: ReactNode }) {
  const [showOrder, setShowOrder] = useState(false)
  const cart = useAtomValue(cartAtom)
  const slot = useAtomValue(slotCodeAtom)
  const [orderDate, orderNum] = (useAtomValue(orderNumberAtom) || "").split("_")

  return (
    <>
      <div className="border-b bg-background p-2 md:hidden">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-foreground/5 p-1">
          <Button
            variant="ghost"
            aria-pressed={!showOrder}
            onClick={() => setShowOrder(false)}
            className={cn(segmentClass, !showOrder && segmentActiveClass)}
          >
            Бараа
          </Button>
          <Button
            variant="ghost"
            aria-pressed={showOrder}
            onClick={() => setShowOrder(true)}
            className={cn(segmentClass, showOrder && segmentActiveClass)}
          >
            Захиалга ({cart.length})
          </Button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <section
          aria-label="Бараа сонгох"
          className={cn(
            "relative min-w-0 flex-1 flex-col bg-background md:flex",
            showOrder ? "hidden" : "flex"
          )}
        >
          {children}
        </section>
        <aside
          aria-label="Захиалгын сагс"
          className={cn(
            "relative min-h-0 w-full shrink-0 flex-col overflow-y-auto border-l bg-background md:flex md:w-[clamp(320px,31vw,490px)]",
            showOrder ? "flex" : "hidden"
          )}
        >
          <div className="flex h-10 shrink-0 items-center gap-2 border-b bg-background px-3">
            <h2 className="flex-none text-[13px] font-medium">Захиалга</h2>
            <span
              className="flex-none rounded-sm bg-accent px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums"
              title={orderDate || undefined}
            >
              {orderNum ? `#${orderNum}` : "Шинэ"}
            </span>
            {slot && (
              <Badge variant="default" className="h-5 rounded-sm px-1.5">
                Ширээ {slot}
              </Badge>
            )}
            <span
              className="ml-auto flex-none text-xs tabular-nums text-muted-foreground"
              aria-label={`${cart.length} нэр төрлийн бараа`}
            >
              {cart.length} бараа
            </span>
          </div>
          <CheckoutMain receipt />
        </aside>
      </div>
    </>
  )
}
