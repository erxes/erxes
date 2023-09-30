"use client"
import { activeCategoryAtom } from "@/store"
import { useQuery } from "@apollo/client"
import { useAtom } from "jotai"

import { LoaderIcon, LoaderWrapper } from "@/components/ui/loader"
import { RadioGroup } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"

import { queries } from "../auth/graphql"
import CategoryItem from "./components/categoryItem/categoryItem.kiosk"

const ProductCategories = () => {
  const [activeCategory, setActiveCategory] = useAtom(activeCategoryAtom)

  const { data, loading } = useQuery(queries.getInitialCategories, {
    onCompleted(data) {
      const { initialCategoryIds } = data?.currentConfig || {}
      !!(initialCategoryIds || []).length &&
        setActiveCategory(initialCategoryIds[0])
    },
  })

  const { initialCategoryIds } = data?.currentConfig || {}

  if (loading || !(initialCategoryIds || []).length)
    return (
      <div className="h-full overflow-hidden">
        <LoaderWrapper className="h-full">
          <LoaderIcon className="mx-2" />
        </LoaderWrapper>
      </div>
    )

  return (
    <ScrollArea className="h-full overflow-hidden max-h-full pr-4">
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
    </ScrollArea>
  )
}

export default ProductCategories
