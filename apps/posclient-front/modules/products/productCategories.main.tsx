"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { activeCategoryAtom, activeCatName, modeAtom } from "@/store"
import { useAtomValue } from "jotai"
import { MenuIcon, SlidersHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import ProductCount from "./components/productCount"

const Categories = dynamic(() => import("./components/CategoriesSheet"))

const ProductCategories = () => {
  const activeCat = useAtomValue(activeCategoryAtom)
  const catName = useAtomValue(activeCatName)
  const mode = useAtomValue(modeAtom)
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {mode === "mobile" ? (
          <Button size="icon" variant="secondary">
            <SlidersHorizontalIcon className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="outline"
            className="h-7 flex-none gap-1.5 rounded border-0 px-2.5 text-[13px] font-medium whitespace-nowrap shadow-xs hover:bg-accent"
            size="sm"
          >
            <MenuIcon className="size-4 text-muted-foreground" />
            {!!activeCat ? catName : "Ангилал"}
            <ProductCount />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex h-screen w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-sm"
      >
        {open && <Categories setOpen={setOpen} />}
      </SheetContent>
    </Sheet>
  )
}

export default ProductCategories
