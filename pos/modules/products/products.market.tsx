import { CommandEmpty, CommandGroup } from "cmdk"

import { ScrollArea } from "@/components/ui/scroll-area"

import ProductItem from "./components/productItem/productItem.market"
import { useProducts } from "./hooks/useProducts"

const Products = () => {
  const { products, loading } = useProducts()

  if (loading) return <div className="mt-4">loading...</div>

  return (
    <>
      <CommandEmpty>
        {loading ? "Хайж байна..." : "Бараа олдсонгүй..."}
      </CommandEmpty>
      <ScrollArea className="mt-4 flex-auto">
        <CommandGroup>
          {products.map((product) => (
            <ProductItem key={product._id} {...product} />
          ))}
        </CommandGroup>
      </ScrollArea>
    </>
  )
}

export default Products
