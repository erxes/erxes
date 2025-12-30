import { paidProductsAtom, payByProductAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"
import { Minus, Plus, TruckIcon } from "lucide-react"

import { PayByProductItem, OrderItem as T } from "@/types/order.types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FocusChanger } from "@/components/ui/focus-changer"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { countBtnClass } from "../cartItem/cartItem.main"

const OrderItem = ({ _id, productName, unitPrice, isTake, count }: T) => {
  const [payByProduct, setPayByProduct] = useAtom(payByProductAtom)
  const paidProducts = useAtomValue(paidProductsAtom)
  const product = payByProduct.find((pr) => pr._id === _id)
  const paidProduct = paidProducts.find((pr) => pr._id === _id)
  const paidCount = paidProduct?.count || 0
  const availableCount = count - (paidCount || 0)

  const changeValue = (c: number): PayByProductItem[] => {
    const newPrs = payByProduct.slice()
    if (c <= 0) return newPrs.filter((pr) => pr._id !== _id)

    if (product)
      return newPrs.map((pr) =>
        pr._id === _id
          ? { ...pr, count: c >= availableCount ? availableCount : c }
          : pr
      )

    newPrs.push({
      _id,
      count: c >= availableCount ? availableCount : c,
      unitPrice,
    })
    return newPrs
  }

  const handleChange = (c: number) => setPayByProduct(changeValue(c))

  return (
    <div
      key={_id}
      className="border-white/20 mx-4 flex items-stretch overflow-hidden pt-4 flex-wrap mb-2"
    >
      <div className="w-1/12 flex flex-col justify-center items-start">
        <Checkbox
          className="border-white/50"
          checked={product?.count === availableCount}
          onCheckedChange={(checked) =>
            handleChange(checked ? availableCount : 0)
          }
        />
      </div>
      <div className="w-6/12">
        <p>{productName}</p>
        <div className="mt-1 font-bold space-y-2">
          {unitPrice.toLocaleString()}₮ {isTake && <TruckIcon />}
        </div>
      </div>
      <div className="w-5/12 flex items-center justify-end">
        <Button
          className={countBtnClass}
          onClick={() => handleChange((product?.count || 0) - 1)}
        >
          <Minus className="h-3 w-3" strokeWidth={4} />
        </Button>
        <FocusChanger>
          <Input
            className="mx-2 w-16 border-none p-1 text-center text-sm font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            type="number"
            value={product?.count || 0}
            onChange={(e) => handleChange(Number(e.target.value))}
          />
        </FocusChanger>
        <Button
          className={countBtnClass}
          onClick={() => handleChange((product?.count || 0) + 1)}
          disabled={availableCount === 0}
        >
          <Plus className="h-3 w-3" strokeWidth={4} />
        </Button>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Slider
              value={[(paidCount + (product?.count || 0)) * 100]}
              max={count * 100}
              onValueChange={(value) => handleChange(value[0] / 100)}
              className={"w-full my-2"}
              disabled={availableCount === 0}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Төлөлтийн хувь {paidCount}/{count}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default OrderItem
