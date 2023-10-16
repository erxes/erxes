"use client"

import { updateCartAtom } from "@/store/cart.store"
import { motion } from "framer-motion"
import { useSetAtom } from "jotai"
import { MinusIcon, PlusIcon, X } from "lucide-react"

import { OrderItem } from "@/types/order.types"
import { formatNum } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const CartItem = ({
  _id,
  index,
  count,
  productName,
  unitPrice,
}: OrderItem & { index: number }) => {
  const updateCart = useSetAtom(updateCartAtom)
  const formattedIndex = (index + 1).toString().padStart(2, "0")

  const handleUpdate = (newCount: number | string) =>
    updateCart({ _id, count: Number(newCount) })

  return (
    <motion.div
      className="mb-0.5 flex items-center rounded bg-gray-100 px-4 first:bg-primary/10 first:font-medium"
      variants={itemVariants}
      initial="initial"
      exit="exit"
      transition={{
        duration: 0.3,
        opacity: { duration: 0.1 },
      }}
    >
      <div className="w-1/12">{formattedIndex}</div>
      <div className="w-4/12">{productName}</div>
      <div className="w-3/12">
        <div className="inline-flex overflow-hidden rounded border border-primary/40">
          <Button
            className={btnClassName}
            Component="div"
            onClick={() => handleUpdate(count - 1)}
          >
            <MinusIcon className="h-3 w-3" />
          </Button>
          <Input
            className="h-6 w-16 rounded-none border-none px-2 py-0 text-center"
            focus={false}
            type="number"
            value={count}
            onChange={(e) => handleUpdate(e.target.value)}
          />
          <Button
            className={btnClassName}
            Component="div"
            onClick={() => handleUpdate(count + 1)}
          >
            <PlusIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex w-4/12">
        <span className="block h-4 w-6/12 overflow-hidden">{"-"}</span>
        <span className="w-5/12 font-extrabold">{formatNum(unitPrice)}₮</span>
        <Button
          className="h-4 w-4 rounded-full bg-warning p-0 hover:bg-warning/90"
          Component="div"
          onClick={() => handleUpdate(-1)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  )
}

const btnClassName =
  "h-6 w-4 flex-none rounded-none p-0 bg-primary/20 text-black hover:bg-primary/30"

const itemVariants = {
  initial: {
    height: "auto",
    opacity: 1,
    paddingTop: 4,
    paddingBottom: 4,
  },
  exit: {
    height: 0,
    opacity: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
}

export default CartItem
