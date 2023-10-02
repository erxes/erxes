"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { activeCategoryAtom, activeCatName } from "@/store"
import { useAtomValue } from "jotai"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import ProductCount from "./components/productCount"
import InitialCategories from "./InitialCategories"

const Categories = dynamic(() => import("./components/CategoriesSheet"))

const ProductCategories = () => {
  const activeCat = useAtomValue(activeCategoryAtom)
  const catName = useAtomValue(activeCatName)
  const [open, setOpen] = useState(false)

  return (
    <>
      <Sheet open={open} onOpenChange={() => setOpen(!open)}>
        <SheetTrigger asChild>
          <Button className="my-2 mr-2 font-bold whitespace-nowrap" size="sm">
            <MenuIcon className="h-4 w-4 mr-1" strokeWidth={3} />
            {!!activeCat ? catName : "Ангилал"}
            <ProductCount />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="sm:max-w-md w-full flex flex-col overflow-hidden h-screen p-4 pr-0"
        >
          {open && <Categories setOpen={setOpen} />}
        </SheetContent>
      </Sheet>
      <InitialCategories />
    </>
  )
}

export default ProductCategories
