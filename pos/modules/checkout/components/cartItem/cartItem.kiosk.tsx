import { updateCartAtom } from "@/store/cart.store"
import { useSetAtom } from "jotai"
import { MinusIcon, PlusIcon, XIcon } from "lucide-react"

import { OrderItem } from "@/types/order.types"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import Image from "@/components/ui/image"

const CartItem = ({
  productImgUrl,
  productName,
  unitPrice,
  _id,
  count,
}: OrderItem) => {
  const changeItem = useSetAtom(updateCartAtom)
  return (
    <div className="bg-white w-6/12 flex rounded-lg items-center relative min-w-[31vw]">
      <div className="w-5/12">
        <AspectRatio ratio={1}>
          <Image
            alt=""
            src={productImgUrl || ""}
            sizes="10wv"
            className="object-contain"
          />
        </AspectRatio>
      </div>
      <div className="w-7/12 pl-1">
        <small className="font-bold block leading-3 max-h-6 overflow-hidden mb-1">
          {productName}
        </small>
        <small className="font-bold block leading-3">
          {(unitPrice * count).toLocaleString()}₮
        </small>
        <div className="flex items-center gap-1 mt-1">
          <Button
            variant={"outline"}
            size={"sm"}
            className="h-5 w-5 p-0"
            onClick={() => changeItem({ _id, count: (count || 0) - 1 })}
          >
            <MinusIcon />
          </Button>
          <div className="w-5 font-bold text-center">{count}</div>
          <Button
            size={"sm"}
            className="h-5 w-5 p-0"
            onClick={() => changeItem({ _id, count: (count || 0) + 1 })}
          >
            <PlusIcon />
          </Button>
        </div>
      </div>
      <Button
        className="h-5 w-5 p-0 bg-destructive hover:bg-destructive/90 rounded-full absolute -top-2.5 right-2"
        onClick={() => changeItem({ _id, count: -1 })}
      >
        <XIcon />
      </Button>
    </div>
  )
}

export default CartItem
