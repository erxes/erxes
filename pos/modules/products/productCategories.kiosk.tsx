"use client"

import { activeCategoryAtom } from "@/store"
import { initialCategoryIdsAtom } from "@/store/config.store"
import { useAtom, useAtomValue } from "jotai"

import { RadioGroup } from "@/components/ui/radio-group"
import { ScrollAreaYWithButton } from "@/components/ui/scroll-area"

import CategoryItem from "./components/categoryItem/categoryItem.kiosk"

const ProductCategories = () => {
  const [activeCategory, setActiveCategory] = useAtom(activeCategoryAtom)
  const initialCategoryIds = useAtomValue(initialCategoryIdsAtom)

  return (
    <ScrollAreaYWithButton className="h-full overflow-hidden max-h-full pr-4">
      <RadioGroup
        className="space-y-1"
        value={activeCategory || ""}
        onValueChange={(value) => setActiveCategory(value)}
      >
        {initialCategoryIds?.map((_id: string) => (
          <>
            <CategoryItem _id={_id} key={_id} active={_id === activeCategory} />
            <div className="border-b" key={_id + "border"} />
          </>
        ))}
      </RadioGroup>
    </ScrollAreaYWithButton>
  )
}

export default ProductCategories
