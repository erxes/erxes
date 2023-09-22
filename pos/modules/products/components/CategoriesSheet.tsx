import { useEffect, useState } from "react"
import { activeCatName, activeCategoryAtom } from "@/store"
import { useAtom, useSetAtom } from "jotai"
import { ArrowRight, ChevronRightIcon } from "lucide-react"

import { ICategory } from "@/types/product.types"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import useProductCategories from "../hooks/useProductCategories"
import SubCategory from "./SubCategory"

const CategoriesSheet = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const setCatName = useSetAtom(activeCatName)
  const { categories, loading } = useProductCategories()

  const getCategoryByField = (value: string, field: keyof ICategory) =>
    categories.find((e) => e[field] === value)

  const getSubCats = (parentOrder: string, tier?: number) =>
    categories.filter(
      ({ order }) =>
        order !== parentOrder &&
        order.includes(parentOrder) &&
        (tier ? (order || "").split("/").length <= tier : true)
    )

  const rootCats = getSubCats("", 3) || []

  const [activeCat, setActiveCat] = useAtom(activeCategoryAtom)

  const [activeParent, setActiveParent] = useState<string | null>(
    rootCats[0]?.order || ""
  )

  useEffect(() => {
    const activeCategoryOrder = getCategoryByField(activeCat, "_id")?.order
    const activeCategoryParent = rootCats.find((c) =>
      activeCategoryOrder?.includes(c.order)
    )?.order
    if (activeCategoryParent! == activeParent) {
      setActiveParent(activeCategoryParent || "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeParent])

  if (loading) return <div>Loading...</div>

  const chooseCat = (_id: string) => {
    setActiveCat(activeCat === _id ? "" : _id)
    setCatName(getCategoryByField(_id, "_id")?.name || "")
    setOpen(false)
  }

  return (
    <div className="grid grid-cols-3 gap-2 overflow-hidden flex-auto">
      <ScrollArea className="overflow-hidden max-h-full">
        <div className="space-y-1 pr-3">
          {rootCats.map((e) => (
            <Button
              variant={activeParent === e.order ? "default" : "outline"}
              className="text-sm w-full justify-start items-center font-semibold lowercase"
              key={e._id}
              size="sm"
              onClick={() => setActiveParent(e.order)}
            >
              <ChevronRightIcon className="h-5 w-5 mr-1" strokeWidth={2} />
              {e.name}
            </Button>
          ))}
          <Button
            variant={"link"}
            className=" font-semibold text-sm"
            onClick={() => {
              chooseCat("")
            }}
          >
            Бүгдийг үзэх <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </ScrollArea>
      <ScrollArea className="overflow-hidden max-h-full col-span-2">
        {activeParent && (
          <div className="bg-slate-100 p-3 rounded mb-3 mx-3 flex justify-between items-center">
            <h1 className="text-base font-bold">
              {getCategoryByField(activeParent, "order")?.name}
            </h1>
            <Button
              variant={"link"}
              className="h-auto p-0 font-semibold text-sm"
              onClick={() =>
                chooseCat(getCategoryByField(activeParent, "order")?._id || "")
              }
            >
              Бүгдийг үзэх <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-5 px-3">
          {activeParent &&
            Array.from({ length: 2 }).map((_, idx) => (
              <div className="space-y-5" key={idx}>
                {getSubCats(activeParent, 4)
                  .filter((_, i) => i % 2 === idx)
                  .map((category) => (
                    <SubCategory
                      {...category}
                      subCats={getSubCats(category.order)}
                      key={category._id}
                      chooseCat={chooseCat}
                    />
                  ))}
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default CategoriesSheet
