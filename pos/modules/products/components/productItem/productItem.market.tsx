import { addToCartAtom } from "@/store/cart.store"
import { setSearchPopoverAtom } from "@/store/ui.store"
import { useAtom } from "jotai"
import { SearchIcon } from "lucide-react"

import { IProduct } from "@/types/product.types"

const ProductItem = (props: IProduct) => {
  const { name, code } = props
  const [, addToCart] = useAtom(addToCartAtom)
  const [, changePopover] = useAtom(setSearchPopoverAtom)

  return (
    <div
      className="mb-1 flex items-center rounded px-2 py-1 hover:bg-neutral-100"
      onClick={() => {
        addToCart(props)
        changePopover(false)
      }}
    >
      <SearchIcon className="mr-2 h-4 w-4 text-black/50" />
      <span>
        {name} - {code}
      </span>
    </div>
  )
}

export default ProductItem
