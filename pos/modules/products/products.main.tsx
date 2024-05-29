"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"

import { Button } from "@/components/ui/button"
import { LoaderIcon } from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"

import ProductItem from "./components/productItem/productItem.main"
import { FETCH_MORE_PER_PAGE, useProducts } from "./hooks/useProducts"

const Products = () => {
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { products, productsCount, loading, handleLoadMore } = useProducts()

  useEffect(() => {
    inView && handleLoadMore()
  }, [handleLoadMore, inView])

  if (loading) return <div className="p-4">loading...</div>

  return (
    <ScrollArea className="w-full pr-3">
      <div className="grid grid-cols-4 gap-x-2 gap-y-3">
        {products.map((product) => (
          <ProductItem key={product._id} {...product} />
        ))}
      </div>
      {productsCount > FETCH_MORE_PER_PAGE &&
        products.length < productsCount && (
          <Button className="w-full my-3" ref={ref} variant="outline">
            <LoaderIcon />
            Уншиж байна ( {products.length} / {productsCount} )
          </Button>
        )}
    </ScrollArea>
  )
}

export default Products
