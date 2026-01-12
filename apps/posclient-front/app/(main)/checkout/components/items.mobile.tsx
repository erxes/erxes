import { cartAtom } from "@/store/cart.store"
import { useAtomValue } from "jotai"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "@/components/ui/image"

const Items = () => {
  const items = useAtomValue(cartAtom)
  return (
    <div className="space-y-2 w-full">
      {items.map(({ count, productName, productImgUrl, unitPrice, _id }) => {
        return (
          <div key={_id} className="flex items-center pr-4">
            <div className="w-2/12 flex-none bg-slate-100 rounded-md">
              <AspectRatio ratio={1}>
                <Image
                  src={productImgUrl || ""}
                  alt={productName || ""}
                  className="object-cover"
                />
              </AspectRatio>
            </div>
            <div className="flex-auto px-3">
              {productName}
              <div className="text-primary font-semibold">
                {unitPrice.toLocaleString()}₮
              </div>
            </div>
            <div className="whitespace-nowrap font-bold">x{count}</div>
          </div>
        )
      })}
    </div>
  )
}

export default Items
