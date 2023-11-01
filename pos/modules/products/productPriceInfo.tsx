import { useState } from "react"
import { useQuery } from "@apollo/client"

import { cn, formatNum } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Skeleton } from "@/components/ui/skeleton"

import queries from "./graphql/queries"

const CartItemPriceInfo = ({
  productId,
  price,
}: {
  productId: string
  price: number
}) => {
  const { data, loading } = useQuery(queries.getPriceInfo, {
    variables: { productId },
    skip: !productId,
  })

  const obj = (data || {}).getPriceInfo
  const info = !!obj && JSON.parse(obj)
  const { value, price: discountPrice } = (info || {})[productId] || info || {}

  const show = !!discountPrice

  return (
    <HoverCardContent className="w-40 text-center">
      {loading ? (
        <Skeleton className="h-4 w-20" />
      ) : (
        `${formatNum(show ? discountPrice : price)}₮ ${show ? "/" + value : ""}`
      )}
    </HoverCardContent>
  )
}

const ProductPrice = ({
  productId,
  unitPrice,
  className,
}: {
  productId: string
  unitPrice: number
  className: string
}) => {
  const [openPriceInfo, setOpenPriceInfo] = useState<boolean>(false)
  return (
    <HoverCard open={openPriceInfo} onOpenChange={(op) => setOpenPriceInfo(op)}>
      <HoverCardTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "font-extrabold p-1 h-auto hover:bg-black/10",
            className
          )}
        >
          {formatNum(unitPrice)}₮
        </Button>
      </HoverCardTrigger>
      {openPriceInfo && (
        <CartItemPriceInfo productId={productId} price={unitPrice} />
      )}
    </HoverCard>
  )
}

export default ProductPrice
