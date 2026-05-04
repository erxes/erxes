import useProductCategories from "@/modules/products/hooks/useProductCategories"
import { categoriesToPrintAtom } from "@/store"
import { configAtom } from "@/store/config.store"
import { useAtom, useAtomValue } from "jotai"
import { Plus } from "lucide-react"

import { ICategory } from "@/types/product.types"
import { Button } from "@/components/ui/button"
import { FacetedFilter } from "@/components/ui/faceted-filter"
import Loader from "@/components/ui/loader"

const isSameOrDescendant = (value: string, candidate: string) =>
  value === candidate || value.startsWith(`${candidate}/`)

const hasCategoryOverlap = (left: string, right: string) =>
  isSameOrDescendant(left, right) || isSameOrDescendant(right, left)

const normalizeGroup = (group: string[]) => {
  const uniqueValues = Array.from(new Set(group))

  return uniqueValues.filter(
    (value, index) =>
      !uniqueValues.some(
        (other, otherIndex) =>
          otherIndex !== index && isSameOrDescendant(value, other)
      )
  )
}

const normalizeStoredGroups = (groups: string[][]) => {
  const takenValues: string[] = []

  return groups.map((group) => {
    const normalizedGroup = normalizeGroup(group).filter(
      (value) =>
        !takenValues.some((takenValue) => hasCategoryOverlap(value, takenValue))
    )

    takenValues.push(...normalizedGroup)

    return normalizedGroup
  })
}

const normalizeUpdatedGroups = (groups: string[][], index: number) => {
  const normalizedGroups = groups.map((group) => normalizeGroup(group))
  const takenValues = normalizedGroups.flatMap((group, groupIndex) =>
    groupIndex === index ? [] : group
  )

  normalizedGroups[index] = normalizedGroups[index].filter(
    (value) =>
      !takenValues.some((takenValue) => hasCategoryOverlap(value, takenValue))
  )

  return normalizedGroups
}

const CategoriesToPrint = () => {
  const [categoriesToPrint, setCategoriesToPrint] = useAtom(
    categoriesToPrintAtom
  )
  const config = useAtomValue(configAtom)
  const { isActive, isPrint } = config?.kitchenScreen || {}
  const { loading, categories } = useProductCategories((cats) => {
    const validOrders = cats.map((c: ICategory) => c.order)
    setCategoriesToPrint(
      normalizeStoredGroups(
        categoriesToPrint.map((filterGroup) =>
          filterGroup.filter((cat) => validOrders.includes(cat))
        )
      )
    )
  }, isActive || !isPrint)

  if (isActive || !isPrint) {
    return null
  }

  if (loading) return <Loader />

  const addNewFilter = () => {
    setCategoriesToPrint((prev) => [...prev, []])
  }

  const removeFilter = (index: number) => {
    if (categoriesToPrint.length > 1) {
      setCategoriesToPrint((prev) =>
        prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
      )
    }
  }

  const updateFilter = (index: number, value: string[]) => {
    setCategoriesToPrint((prev) => {
      const updated = [...prev]
      updated[index] = value
      return normalizeUpdatedGroups(updated, index)
    })
  }

  return (
    <div className="w-full space-y-3">
      {categoriesToPrint.map((filterGroup, index) => (
        <div
          key={`category-filter-${index}-${(filterGroup || []).join("|")}`}
          className="flex items-center gap-2"
        >
          <div className="flex-1">
            <FacetedFilter
              options={(categories || []).map((category) => ({
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
              className="w-8 h-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              aria-label={`Remove filter group ${index + 1}`}
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
        className="w-full h-8 text-xs border-dashed text-muted-foreground hover:border-solid"
      >
        <Plus className="w-3 h-3 mr-1" />
        Шинэ принт нэмэх
      </Button>
    </div>
  )
}

export default CategoriesToPrint
