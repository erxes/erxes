import { productCountAtom } from "@/store"
import { useAtomValue } from "jotai"

const ProductCount = () => {
  const count = useAtomValue(productCountAtom)
  if (!count) return null
  return <span className="pl-1">({count})</span>
}

export default ProductCount
