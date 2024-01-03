import { addToCartAtom } from "@/store/cart.store"
import { changeFocusAtom, searchPopoverAtom } from "@/store/ui.store"
import { useSetAtom } from "jotai"
import { SearchIcon } from "lucide-react"

import { IProduct } from "@/types/product.types"
import { CommandItem } from "@/components/ui/command"

const ProductItem = (props: IProduct) => {
  const { name, code } = props
  const addToCart = useSetAtom(addToCartAtom)
  const closePopover = useSetAtom(searchPopoverAtom)
  const changeFocus = useSetAtom(changeFocusAtom)

  const onSelect = () => {
    addToCart(props)
    setTimeout(() => closePopover(false))
    changeFocus(true)
  }

  return (
    <CommandItem onSelect={onSelect} onClick={onSelect}>
      <SearchIcon className="mr-2 h-4 w-4 text-black/60" />
      <span>
        {name} - {code}
      </span>
    </CommandItem>
  )
}

export default ProductItem
