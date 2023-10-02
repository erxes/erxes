import { ScrollArea } from "@/components/ui/scroll-area"

import ProductItem from "./components/productItem/productItem.market"
import { useProducts } from "./hooks/useProducts"

const Products = () => {
  const { products, loading } = useProducts()

  if (loading) return <div className="mt-4">loading...</div>

  return (
    <ScrollArea className="mt-4 flex-auto">
      {products.map((product) => (
        <ProductItem key={product._id} {...product} />
      ))}
    </ScrollArea>
  )
}

export default Products
