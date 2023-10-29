import { useQuery } from "@apollo/client"

import { formatNum } from "@/lib/utils"
import { HoverCardContent } from "@/components/ui/hover-card"
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

export default CartItemPriceInfo
