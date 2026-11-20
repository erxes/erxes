import { memo, useState } from "react"
import dynamic from "next/dynamic"
import { isSimilarityModeAtom, mobileTabAtom, modeAtom } from "@/store"
import { addToCartAtom } from "@/store/cart.store"
import { isShowRemainderAtom } from "@/store/config.store"
import { useAtomValue, useSetAtom } from "jotai"

import { IProduct } from "@/types/product.types"
import { cn, formatNum } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import Image from "@/components/ui/image"
import { ToastAction } from "@/components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"

const ChooseBulkSimilarity = dynamic(
  () => import("../ChooseFromBulkSimilarity"),
  {
    loading: () => <div style={{ height: "350px" }}></div>,
  }
)

const ProductItem = (props: IProduct) => {
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

  return (
    <>
      <div
        className={cn(
          "group relative flex cursor-pointer select-none flex-col rounded-2xl bg-background p-2.5 text-left shadow-xs transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]",
          isShowRemainder && isCheckRem && remainder === 0 && "opacity-70"
        )}
        onClick={() => {
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
                <ToastAction
                  altText="Goto cart"
                  onClick={() => setTab("checkout")}
                >
                  Сагс руу очих
                </ToastAction>
              ),
            })
        }}
      >
        <div className="relative mb-2.5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-muted/70">
          <Image
            src={(attachment || {}).url || ""}
            alt=""
            width={200}
            height={100}
            className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mb-1.5 line-clamp-2 h-9 px-0.5 text-[13px] font-medium leading-[18px] text-foreground">
                <span className="text-muted-foreground">{code}</span>
                {` - ${name}`}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div>{`${code} - ${name}`}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="mt-auto flex items-center justify-between gap-2 px-0.5 text-left">
          <p className="text-base font-bold tracking-tight">
            {formatNum(unitPrice)}₮{" "}
            {isShowRemainder && typeof remainder === "number" &&
              (remainders && remainders?.length > 1 ? (
                <HoverCard>
                  <HoverCardTrigger>{"/" + remainder + "/"}</HoverCardTrigger>
                  <HoverCardContent className="w-48">
                    <div className="flex flex-col border border-b-0">
                      {remainders?.map(({ location, remainder }) => (
                        <div
                          key={location}
                          className="flex items-center border-b font-semibold"
                        >
                          <span className="flex-1 border-r p-1 text-left text-muted-foreground">
                            {location}
                          </span>
                          <span className="flex-1 p-1 text-right ">
                            {remainder}
                          </span>
                        </div>
                      ))}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <span>{`/ ${remainder}/`}</span>
              ))}
          </p>
          {hasSimilarity && (
            <span className="shrink-0 whitespace-nowrap rounded-full cursor-pointer bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Сонгох...
            </span>
          )}
        </div>
      </div>
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
