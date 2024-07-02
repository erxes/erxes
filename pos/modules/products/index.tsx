"use client"

import dynamic from "next/dynamic"
import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"

const Market: any = dynamic(() => import("./products.market"))
const Main: any = dynamic(() => import("./products.main"))
const CoffeeShop: any = dynamic(() => import("./products.coffeeShop"))

const Products = () => {
  const mode = useAtomValue(modeAtom)

  return (
    <>
      {mode === "market" && <Market />}
      {!["market", "coffee-shop"].includes(mode) && <Main />}
      {mode === "coffee-shop" && <CoffeeShop />}
    </>
  )
}

export default Products
