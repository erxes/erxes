import { memo, useState } from "react"
import dynamic from "next/dynamic"
import { isSimilarityModeAtom, mobileTabAtom, modeAtom } from "@/store"
import { addToCartAtom } from "@/store/cart.store"
import { isShowRemainderAtom } from "@/store/config.store"
import { useAtomValue, useSetAtom } from "jotai"
import { PlusIcon } from "lucide-react"

import { IProduct } from "@/types/product.types"
import { cn, formatNum } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import Image from "@/components/ui/image"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"

const ChooseBulkSimilarity = dynamic(
  () => import("../ChooseFromBulkSimilarity"),
  {
    loading: () => (
      <div role="status" className="p-8 text-center">
        Уншиж байна…
      </div>
    ),
  }
)

const initialsOf = (value?: string) =>
  (value || "")
    .split(/\s+/)
    .map((word) => word.match(/^\p{L}/u)?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?"

const remainderClass =
  "rounded border bg-muted px-1 text-[11px] font-medium tabular-nums text-muted-foreground"

const ProductItem = ({
  inCart = 0,
  ...props
}: IProduct & { inCart?: number }) => {
  const {
    attachment,
    name,
    code,
    unitPrice,
    remainder,
    remainders,
    isCheckRem,
  } = props
  const [open, setOpen] = useState(false)
  const addToCart = useSetAtom(addToCartAtom)
  const mode = useAtomValue(modeAtom)
  const isShowRemainder = useAtomValue(isShowRemainderAtom)
  const setTab = useSetAtom(mobileTabAtom)

  const isSimilarityMode = useAtomValue(isSimilarityModeAtom)
  const hasSimilarity = isSimilarityMode && props.hasSimilarity

  const handleAdd = () => {
    if (hasSimilarity) {
      setOpen(true)
      return
    }
    addToCart(props)
    mode === "mobile" &&
      toast({
        variant: "default",
        description: `${name} сагсанд нэмэгдлээ`,
        action: (
          <ToastAction altText="Goto cart" onClick={() => setTab("checkout")}>
            Сагс руу очих
          </ToastAction>
        ),
      })
  }

  return (
    <>
      <Card
        className={cn(
          "group relative isolate flex min-w-0 flex-col overflow-hidden rounded-lg bg-background p-1 text-left shadow-sm transition-shadow hover:shadow-lg focus-within:shadow-focus",
          isShowRemainder && isCheckRem && remainder === 0 && "opacity-60",
          inCart > 0 && "ring-1 ring-primary/40"
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
          {attachment?.url ? (
            <Image
              src={attachment.url}
              alt=""
              width={320}
              height={256}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-full items-center justify-center bg-linear-to-br from-primary/10 to-primary/5 text-2xl font-semibold tracking-tight text-primary/70"
            >
              {initialsOf(name)}
            </div>
          )}
          {inCart > 0 && (
            <span className="absolute right-1.5 top-1.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold tabular-nums text-primary-foreground shadow-sm">
              {inCart}
            </span>
          )}
        </div>
        <CardContent className="flex min-w-0 flex-col gap-1.5 px-2 pb-1 pt-2">
          <div
            title={name}
            className="line-clamp-2 min-h-8 text-[13px] font-medium leading-4"
          >
            {name}
          </div>
          {code && (
            <span className="w-fit max-w-full truncate rounded border bg-muted px-1.5 py-px font-mono text-[11px] text-muted-foreground">
              {code}
            </span>
          )}
        </CardContent>
        <CardFooter className="mt-auto items-center justify-between gap-2 px-2 pb-1 pt-1">
          <div className="flex min-w-0 items-baseline gap-1.5">
            <span className="truncate text-sm font-semibold tabular-nums">
              {formatNum(unitPrice)}
              <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                ₮
              </span>
            </span>
            {isShowRemainder &&
              typeof remainder === "number" &&
              (remainders && remainders?.length > 1 ? (
                <HoverCard>
                  <HoverCardTrigger
                    className={cn(remainderClass, "relative z-10")}
                  >
                    {remainder}
                  </HoverCardTrigger>
                  <HoverCardContent className="w-48 p-1">
                    <div className="flex flex-col divide-y text-xs">
                      {remainders?.map(({ location, remainder }) => (
                        <div
                          key={location}
                          className="flex items-center justify-between gap-2 px-2 py-1.5"
                        >
                          <span className="truncate text-muted-foreground">
                            {location}
                          </span>
                          <span className="font-medium tabular-nums">
                            {remainder}
                          </span>
                        </div>
                      ))}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <span className={remainderClass}>{remainder}</span>
              ))}
          </div>
          <span
            aria-hidden="true"
            className="inline-flex h-7 min-w-7 flex-none items-center justify-center rounded bg-accent px-1.5 text-xs font-medium text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
          >
            {hasSimilarity ? "Сонгох" : <PlusIcon className="size-4" />}
          </span>
        </CardFooter>
        <Button
          type="button"
          variant="ghost"
          aria-label={`${name} — ${hasSimilarity ? "Хувилбар сонгох" : "Сагсанд нэмэх"}`}
          onClick={handleAdd}
          className="absolute inset-0 size-full rounded-lg p-0 hover:bg-transparent focus-visible:outline-hidden"
        />
      </Card>
      {hasSimilarity && (
        <Dialog open={open} onOpenChange={() => setOpen(false)}>
          <DialogContent>
            {open && <ChooseBulkSimilarity {...props} setOpen={setOpen} />}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default memo(ProductItem)
