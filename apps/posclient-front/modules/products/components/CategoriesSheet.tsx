import { useCallback, useMemo } from "react"
import { activeCategoryAtom, activeCatName, hiddenParentsAtom } from "@/store"
import { motion } from "framer-motion"
import { useAtom, useSetAtom } from "jotai"
import { Minus, Plus } from "lucide-react"

import { ICategory } from "@/types/product.types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import useProductCategories from "../hooks/useProductCategories"

const CategoriesSheetNew = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const getCategoryByField = (value: string, field: keyof ICategory) =>
    categories.find((e) => e[field] === value)
  const setCatName = useSetAtom(activeCatName)
  const [activeCat, setActiveCat] = useAtom(activeCategoryAtom)
  const [hiddenParents, setHiddenParents] = useAtom(hiddenParentsAtom)

  const { categories, loading } = useProductCategories((cats) => {
    if (!hiddenParents.length) {
      const defaultHiddenCats: string[] = []
      cats.forEach((cat: ICategory) => {
        if (cat.order.split("/").length === 4) {
          !!cats.find(
            (e: ICategory) =>
              e.order?.includes(cat.order) && e.order.length > cat.order.length
          ) && defaultHiddenCats.push(cat.order)
        }
      })
      setHiddenParents(defaultHiddenCats)
    }
  })

  const sortedCategories = useMemo(
    () =>
      [...(categories || [])].sort(
        (a, b) => a.order.split("/").length - b.order.split("/").length
      ),
    [categories]
  )

  const chooseCat = (_id: string) => {
    setActiveCat(activeCat === _id ? "" : _id)
    setCatName(getCategoryByField(_id, "_id")?.name || "")
    setOpen(false)
  }

  const shortestLength = sortedCategories[0]?.order?.split("/").length

  const renderP = useCallback(
    (length: number) =>
      Array.from({ length: length - shortestLength }, (e, i) => (
        <div key={i} className="px-3 h-7">
          <p className="border-l h-7" />
        </div>
      )),
    [shortestLength]
  )

  const handleChangeView = useCallback(
    (cat: ICategory) => {
      const { order } = cat
      if (hiddenParents.includes(order)) {
        setHiddenParents(hiddenParents.filter((e) => e !== order))
      } else {
        setHiddenParents([...hiddenParents, order])
      }
    },
    [hiddenParents, setHiddenParents]
  )

  const checkIsHidden = useCallback(
    (order: string) => {
      const hiddenParent = hiddenParents.find(
        (e) => order.includes(e) && order.length > e.length
      )
      return !!hiddenParent
    },
    [hiddenParents]
  )

  const checkHasChildren = useCallback(
    (order: string) =>
      !!categories.find(
        (e: ICategory) =>
          e.order?.includes(order) && e.order.length > order.length
      ),
    [categories]
  )

  const isHiddenChild = useCallback(
    (order: string) => hiddenParents.includes(order),
    [hiddenParents]
  )

  if (loading) return <>loading..</>

  return (
    <ScrollArea className="overflow-hidden">
      {categories.map((cat) => (
        <motion.div
          className={cn("flex items-center overflow-hidden")}
          key={cat._id}
          animate={{
            height: checkIsHidden(cat.order) ? 0 : "auto",
            opacity: checkIsHidden(cat.order) ? 0 : 1,
          }}
        >
          {renderP(cat.order.split("/").length)}
          {checkHasChildren(cat.order) ? (
            <Button
              className="h-6 w-6 p-0"
              variant="outline"
              onClick={() => handleChangeView(cat)}
            >
              {isHiddenChild(cat.order) ? (
                <Plus className="h-4 w-4" strokeWidth={1.7} />
              ) : (
                <Minus className="h-4 w-4" strokeWidth={1.7} />
              )}
            </Button>
          ) : (
            <div className="h-7 w-0" />
          )}
          <Button
            variant={activeCat === cat._id ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => chooseCat(cat._id)}
          >
            {cat.name}
          </Button>
        </motion.div>
      ))}
    </ScrollArea>
  )
}

export default CategoriesSheetNew
