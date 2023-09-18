import { addToCartAtom } from "@/store/cart.store"
import { useSetAtom } from "jotai"

import { IProduct } from "@/types/product.types"
import { formatNum } from "@/lib/utils"
import Image from "@/components/ui/image"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ProductItem = ({
  attachment,
  name,
  code,
  unitPrice,
  remainder,
  _id,
}: IProduct) => {
  const addToCart = useSetAtom(addToCartAtom)

  return (
    <div
      className="relative rounded-lg border p-3 text-center "
      title={`${code} - ${name}`}
      onClick={() => addToCart({ name, _id, unitPrice })}
    >
      <Image
        src={(attachment || {}).url || ""}
        alt=""
        width={200}
        height={100}
        className="mb-3 aspect-[4/3] h-auto w-full object-contain px-3"
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="mb-1 h-8 overflow-hidden  text-ellipsis text-sm leading-4 ">
              <small>{name}</small>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <p className="font-extrabold">
        {formatNum(unitPrice)}₮ {!!remainder && "/" + remainder + "/"}
      </p>
    </div>
  )
}

export default ProductItem
