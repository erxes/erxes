"use client"

import { cartAtom } from "@/store/cart.store"
import { useAtomValue } from "jotai"

import { formatNum } from "@/lib/utils"

const Components = () => {
  const cart = useAtomValue(cartAtom)
  const formatIndex = (index: number) => (index + 1).toString().padStart(2, "0")
  return (
    <>
      <div className="mb-1 flex rounded border-transparent bg-primary p-3 leading-4 text-white font-semibold text-xs text-center">
        <div className="flex w-6/12 text-left">
          <span className="w-1/6 pl-2">#</span>
          <span className="w-5/6 ">Барааны нэр</span>
        </div>
        <span className="w-2/12">Тоо ширхэг</span>

        <span className="w-2/12">Үнэ</span>
        <span className="w-2/12">Нийт үнэ</span>
      </div>
      {cart.map((item, index) => (
        <div
          key={index}
          className="mb-1 flex items-center rounded bg-gray-100 px-3 text-xs font-semibold h-8 text-center"
        >
          <div className="flex w-6/12 text-left">
            <span className="w-1/6">{formatIndex(index + 1)}</span>
            <span className="w-5/6 ">{item.productName}</span>
          </div>
          <span className="w-2/12">{item.count}</span>
          <span className="w-2/12">{formatNum(item.unitPrice)}₮</span>
          <span className="w-2/12">
            {formatNum(item.unitPrice * item.count)}₮
          </span>
           
        </div>
      ))}
    </>
  )
}

export default Components
