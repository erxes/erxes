"use client"

import { useEffect } from "react"
import { activeCategoryAtom } from "@/store"
import { useAtomValue } from "jotai"
import { useInView } from "react-intersection-observer"

import { Button } from "@/components/ui/button"
import { ScrollAreaYWithButton } from "@/components/ui/scroll-area"

import ActiveCategory from "./components/ActiveCategory.kiosk"
import ProductItem from "./components/productItem/productItem.kiosk"
import { useProducts } from "./hooks/useProducts"

const Products = () => {
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const activeCategory = useAtomValue(activeCategoryAtom)

  const { products, productsCount, loading, handleLoadMore } = useProducts({
    perPage: 15,
    skip: !activeCategory,
  })

  useEffect(() => {
    inView && handleLoadMore()
  }, [handleLoadMore, inView])

  return (
    <div className="col-span-3 h-full flex flex-col max-h-full overflow-hidden pl-4 pr-2 pb-2">
      <ActiveCategory />
      {!loading && (
        <ScrollAreaYWithButton className="flex-auto overflow-hidden">
          <div className="grid grid-cols-3 gap-4 pr-2">
            {products.map((product) => (
              <ProductItem key={product._id} {...product} />
            ))}
          </div>
          {productsCount > 15 && products.length < productsCount && (
            <Button
              className="w-full my-3"
              ref={ref}
              variant="outline"
              loading={true}
            >
              Уншиж байна ( {products.length} / {productsCount} )
            </Button>
          )}
        </ScrollAreaYWithButton>
      )}
    </div>
  )
}

export default Products
