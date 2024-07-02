"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { activeCategoryAtom, activeCatName, modeAtom } from "@/store"
import { useAtomValue } from "jotai"
import { MenuIcon, SlidersHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import ProductCount from "./components/productCount"

const Categories: any = dynamic(() => import("./components/CategoriesSheet"))

const ProductCategories = () => {
  const activeCat = useAtomValue(activeCategoryAtom)
  const catName = useAtomValue(activeCatName)
  const mode = useAtomValue(modeAtom)
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={() => setOpen(!open)}>
      <SheetTrigger asChild>
        {mode === "mobile" ? (
          <Button size="icon" variant="secondary">
            <SlidersHorizontalIcon className="h-5 w-5" />
          </Button>
        ) : (
          <Button className="my-2 mr-2 font-bold whitespace-nowrap" size="sm">
            <MenuIcon className="h-4 w-4 mr-1" strokeWidth={3} />
            {!!activeCat ? catName : "Ангилал"}
            <ProductCount />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="left"
        className="sm:max-w-md w-full flex flex-col overflow-hidden h-screen p-4 pr-0"
        closable={mode === "mobile"}
      >
        {open && <Categories setOpen={setOpen} />}
      </SheetContent>
    </Sheet>
  )
}

export default ProductCategories
