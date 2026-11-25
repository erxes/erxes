"use client"

import { useEffect, useMemo } from "react"
import { cartAtom } from "@/store/cart.store"
import { useAtomValue } from "jotai"
import { PackageSearchIcon } from "lucide-react"
import { useInView } from "react-intersection-observer"

import { Button } from "@/components/ui/button"
import Loader, { LoaderIcon } from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"

import ProductItem from "./components/productItem/productItem.main"
import { FETCH_MORE_PER_PAGE, useProducts } from "./hooks/useProducts"

const Products = () => {
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { products, productsCount, loading, handleLoadMore } = useProducts()
  const cart = useAtomValue(cartAtom)
  const cartCounts = useMemo(() => {
    const counts = new Map<string, number>()
    cart.forEach(({ productId, count }) =>
      counts.set(productId, (counts.get(productId) || 0) + (count || 0))
    )
    return counts
  }, [cart])

  useEffect(() => {
    inView && handleLoadMore()
  }, [handleLoadMore, inView])

  if (loading) return <Loader className="py-32" />

  if (!products.length)
    return (
      <div className="m-auto flex max-w-sm flex-col items-center gap-2 p-6 text-center">
        <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted text-foreground shadow-sm">
          <PackageSearchIcon className="size-6" aria-hidden="true" />
        </span>
        <p className="text-base font-medium tracking-tight">Бараа олдсонгүй</p>
        <p className="text-[13px] text-muted-foreground">
          Өөр нэрээр хайх эсвэл ангиллаа солиод үзнэ үү.
        </p>
      </div>
    )

  return (
    <ScrollArea className="min-w-0 flex-1">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,9rem),1fr))] gap-3 p-px pb-3 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,10rem),1fr))]">
        {products.map((product) => (
          <ProductItem
            key={product._id}
            {...product}
            inCart={cartCounts.get(product._id) || 0}
          />
        ))}
      </div>
      {productsCount > FETCH_MORE_PER_PAGE &&
        products.length < productsCount && (
          <Button
            className="mb-3 h-8 w-full rounded-md border-0 text-[13px] text-muted-foreground shadow-xs"
            onClick={handleLoadMore}
            ref={ref}
            variant="outline"
          >
            <LoaderIcon />
            Уншиж байна ( {products.length} / {productsCount} )
          </Button>
        )}
    </ScrollArea>
  )
}

export default Products
