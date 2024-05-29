import { cartAtom } from "@/store/cart.store"
import { useAtomValue } from "jotai"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "@/components/ui/image"
import { ScrollAreaYWithButton } from "@/components/ui/scroll-area"

const Items = () => {
  const items = useAtomValue(cartAtom)
  return (
    <ScrollAreaYWithButton className="flex-auto border-y overflow-hidden">
      <div className="space-y-2 py-3 w-full">
        {items.map(
          ({ count, productName, productImgUrl, unitPrice }, index) => {
            return (
              <div
                key={index}
                className="flex items-center font-black text-base pr-4"
              >
                <div className="w-3/12 flex-none bg-slate-100 rounded-md">
                  <AspectRatio ratio={1.3}>
                    <Image
                      src={productImgUrl || ""}
                      alt={productName || ""}
                      className="object-cover"
                    />
                  </AspectRatio>
                </div>
                <div className="flex-auto  px-3">{productName}</div>
                <div className="whitespace-nowrap text-primary">
                  {count} x {unitPrice}
                </div>
              </div>
            )
          }
        )}
      </div>
    </ScrollAreaYWithButton>
  )
}

export default Items
