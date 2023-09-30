import { addToCartAtom } from "@/store/cart.store"
import { useSetAtom } from "jotai"

import { IProduct } from "@/types/product.types"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "@/components/ui/image"

const ProductItem = ({ _id, attachment, name, unitPrice }: IProduct) => {
  const addToCart = useSetAtom(addToCartAtom)
  return (
    <div
      key={_id}
      className="bg-neutral-100 rounded-3xl p-2"
      onClick={() => addToCart({ name, _id, unitPrice, attachment })}
    >
      <AspectRatio ratio={1.3}>
        <Image
          src={attachment?.url || ""}
          alt=""
          className="object-cover rounded-2xl"
          sizes="20vw"
        />
      </AspectRatio>
      <h2 className="font-extrabold uppercase mt-2 overflow-hidden text-center text-[20px] leading-none h-5">
        {name}
      </h2>
      <h2 className="font-extrabold uppercase overflow-hidden text-center leading-none text-[20px] mt-1">
        {unitPrice.toLocaleString()}₮
      </h2>
    </div>
  )
}

export default ProductItem
