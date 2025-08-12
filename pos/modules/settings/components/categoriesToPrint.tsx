import useProductCategories from "@/modules/products/hooks/useProductCategories"
import { categoriesToPrintAtom } from "@/store"
import { configAtom } from "@/store/config.store"
import { useAtom, useAtomValue } from "jotai"
import { Plus } from "lucide-react"

import { ICategory } from "@/types/product.types"
import { Button } from "@/components/ui/button"
import { FacetedFilter } from "@/components/ui/faceted-filter"
import Loader from "@/components/ui/loader"

const CategoriesToPrint = () => {
  const [categoriesToPrint, setCategoriesToPrint] = useAtom(
    categoriesToPrintAtom
  )
  const config = useAtomValue(configAtom)
  const { isActive, isPrint } = config?.kitchenScreen || {}
  const { loading, categories } = useProductCategories((cats) => {
    const validOrders = cats.map((c: ICategory) => c.order)
    setCategoriesToPrint(
      categoriesToPrint.map((filterGroup) =>
        filterGroup.filter((cat) => validOrders.includes(cat))
      )
    )
  }, isActive || !isPrint)

  if (isActive || !isPrint) {
    return null
  }

  if (loading) return <Loader />

  const rootCategories = (categories || []).filter(
    (category) =>
      !categories.find(
        (cat) => cat._id !== category._id && category.order.includes(cat.order)
      )
  )

  const getGen = (order: string) => order.split("/").length

  const getDirectChildren = (parentCat: ICategory) => {
    return categories.filter(
      (cat) =>
        cat._id !== parentCat._id &&
        getGen(cat.order) === getGen(parentCat.order) + 1 &&
        cat.order.includes(parentCat.order)
    )
  }

  const getMainCategories: (rCategories: ICategory[]) => ICategory[] = (
    rCategories
  ) => {
    if (!(rCategories || []).length) {
      return [] as ICategory[]
    }
    if (rCategories.length === 1) {
      return getMainCategories(getDirectChildren(rCategories[0]))
    }
    return rCategories
  }

  const addNewFilter = () => {
    setCategoriesToPrint([...categoriesToPrint, []])
  }

  const removeFilter = (index: number) => {
    if (categoriesToPrint.length > 1) {
      setCategoriesToPrint(categoriesToPrint.filter((_, i) => i !== index))
    }
  }

  const updateFilter = (index: number, value: string[]) => {
    const updated = [...categoriesToPrint]
    updated[index] = value
    setCategoriesToPrint(updated)
  }

  return (
    <div className="space-y-3 w-full">
      {categoriesToPrint.map((filterGroup, index) => (
        <div
          key={`category-filter-${index}`}
          className="flex items-center gap-2"
        >
          <div className="flex-1">
            <FacetedFilter
              options={getMainCategories(rootCategories).map((category) => ({
                label: category.name,
                value: category.order,
              }))}
              title="Бэлтгэх ангилалууд"
              values={filterGroup}
              onSelect={(value) => updateFilter(index, value)}
            />
          </div>

          {categoriesToPrint.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFilter(index)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              ❌
            </Button>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addNewFilter}
        className="w-full h-8 text-xs text-muted-foreground border-dashed hover:border-solid"
      >
        <Plus className="h-3 w-3 mr-1" />
        Шинэ принт нэмэх
      </Button>
    </div>
  )
}

export default CategoriesToPrint
