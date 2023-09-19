import { forwardRef, useState } from "react"
import dynamic from "next/dynamic"
import { addToCartAtom } from "@/store/cart.store"
import { useSetAtom } from "jotai"

import { IProduct } from "@/types/product.types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import Image from "@/components/ui/image"

const ChooseSimilarities = dynamic(() => import("../ChooseFromSimilarities"), {
  loading: () => <div style={{ height: "350px" }}></div>,
})

const ProductItem = (props: IProduct) => {
  const [open, setOpen] = useState(false)
  const { attachment, name, unitPrice, description, hasSimilarity, _id } = props
  const addToCart = useSetAtom(addToCartAtom)

  const renderContent = () => (
    <>
      <ProductItemImage src={attachment?.url || ""} />
      <ProductItemTitle>{name}</ProductItemTitle>
      <ProductItemDescription>{description || ""}</ProductItemDescription>
      <ProductItemPriceWithWrapper unitPrice={unitPrice}>
        <ProductItemButton>Нэмэх</ProductItemButton>
      </ProductItemPriceWithWrapper>
    </>
  )

  if (!hasSimilarity)
    return (
      <ProductItemWrapper onClick={() => addToCart({ name, _id, unitPrice })}>
        {renderContent()}
      </ProductItemWrapper>
    )

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild>
        <ProductItemWrapper>{renderContent()}</ProductItemWrapper>
      </DialogTrigger>
      <DialogContent>{open && <ChooseSimilarities {...props} />}</DialogContent>
    </Dialog>
  )
}

export const ProductItemWrapper = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    className?: string
    onClick?: () => void
  }
>(({ children, className, ...rest }, ref) => (
  <div className={cn("border p-4 rounded-md", className)} ref={ref} {...rest}>
    {children}
  </div>
))

export const ProductItemImage = ({
  src,
  big,
  className,
}: {
  src: string
  big?: boolean
  className?: string
}) => {
  const size = (big ? 2 : 1) * 100
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn("w-full object-contain h-24", className)}
      quality={100}
    />
  )
}

export const ProductItemTitle = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <CardTitle
      className={cn(
        "font-semibold text-sm pt-1 leading-none h-8 mb-2",
        className
      )}
    >
      {children}
    </CardTitle>
  )
}

export const ProductItemDescription = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={cn("text-neutral-500 mb-3", className)}>{children}</div>
  )
}

export const ProductItemPriceWithWrapper = ({
  children,
  className,
  unitPrice,
}: {
  children: React.ReactNode
  className?: string
  unitPrice: number
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="font-black text-base">{unitPrice.toLocaleString()}₮</div>
      {children}
    </div>
  )
}

export const ProductItemButton = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) => (
  <Button
    className={cn(
      "bg-green-500 hover:bg-green-400 font-black flex-auto max-w-[5rem] text-sm",
      className
    )}
    size={"sm"}
    onClick={onClick}
  >
    {children}
  </Button>
)

ProductItemWrapper.displayName = "ProductItemWrapper"

export default ProductItem
