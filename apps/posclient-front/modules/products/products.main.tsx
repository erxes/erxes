"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"

import { Button } from "@/components/ui/button"
import Loader, { LoaderIcon } from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"

import  ProductItem from "./components/productItem/productItem.main"
import { FETCH_MORE_PER_PAGE, useProducts } from "./hooks/useProducts"

const Products = () => {
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { products, productsCount, loading, handleLoadMore } = useProducts()

  useEffect(() => {
    inView && handleLoadMore()
  }, [handleLoadMore, inView])

  if (loading) return <Loader className="py-32" />

  return (
    <ScrollArea className="w-full md:pr-3">
      <div className="grid grid-cols-2 gap-3 p-0.5 pb-3 md:grid-cols-4 2xl:grid-cols-5">
        {products.map((product) => (
          <ProductItem key={product._id} {...product} />
        ))}
      </div>
      {productsCount > FETCH_MORE_PER_PAGE &&
        products.length < productsCount && (
          <Button
            className="w-full my-3 rounded-xl text-muted-foreground"
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
