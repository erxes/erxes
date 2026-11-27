import { productCountAtom } from "@/store"
import { useAtomValue } from "jotai"

const ProductCount = () => {
  const count = useAtomValue(productCountAtom)
  if (!count) {
    return null
  }
  return (
    <span className="rounded-sm bg-accent px-1.5 text-xs font-medium tabular-nums text-muted-foreground">
      {count}
    </span>
  )
}

export default ProductCount
