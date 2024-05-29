"use client"

import dynamic from "next/dynamic"
import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"

const Market = dynamic(() => import("./products.market"))
const Main = dynamic(() => import("./products.main"))
const CoffeeShop = dynamic(() => import("./products.coffeeShop"))

const Products = () => {
  const mode = useAtomValue(modeAtom)

  return (
    <>
      {mode === "market" && <Market />}
      {["main", "restaurant"].includes(mode) && <Main />}
      {mode === "coffee-shop" && <CoffeeShop />}
    </>
  )
}

export default Products
