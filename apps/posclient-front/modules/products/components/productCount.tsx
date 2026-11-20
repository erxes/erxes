import { productCountAtom } from "@/store"
import { useAtomValue } from "jotai"

const ProductCount = () => {
  const count = useAtomValue(productCountAtom)
  if (!count) {
    return null
  }
  return <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 text-xs font-semibold text-primary">
      {count}
    </span>
}

export default ProductCount
