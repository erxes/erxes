import { useEffect, useState } from "react"
import useProductCategories from "@/modules/products/hooks/useProductCategories"
import {
  categoriesToPrintAtom,
  qzCategoryPrintersAtom,
  qzTrayEnabledAtom,
} from "@/store"
import { configAtom } from "@/store/config.store"
import { useAtom, useAtomValue } from "jotai"
import { Plus, X } from "lucide-react"

import { ICategory } from "@/types/product.types"
import useQzPrinters from "@/lib/useQzPrinters"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FacetedFilter } from "@/components/ui/faceted-filter"
import Loader from "@/components/ui/loader"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

let filterGroupKeyCounter = 0

const createFilterGroupKey = () => {
  filterGroupKeyCounter += 1
  return `category-filter-${filterGroupKeyCounter}`
}

const createFilterGroupKeys = (count: number) =>
  Array.from({ length: count }, createFilterGroupKey)

const CategoriesToPrint = () => {
  const [categoriesToPrint, setCategoriesToPrint] = useAtom(
    categoriesToPrintAtom
  )
  const [categoryPrinters, setCategoryPrinters] = useAtom(
    qzCategoryPrintersAtom
  )
  const qzEnabled = useAtomValue(qzTrayEnabledAtom)
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
  const { printers, loading: printersLoading } = useQzPrinters(qzEnabled)
  const [filterKeys, setFilterKeys] = useState(() =>
    createFilterGroupKeys(categoriesToPrint.length)
  )

  useEffect(() => {
    setFilterKeys((prev) => {
      if (prev.length === categoriesToPrint.length) {
        return prev
      }

      if (prev.length < categoriesToPrint.length) {
        return [
          ...prev,
          ...createFilterGroupKeys(categoriesToPrint.length - prev.length),
        ]
      }

      return prev.slice(0, categoriesToPrint.length)
    })
  }, [categoriesToPrint.length])

  if (isActive || !isPrint) {
    return null
  }

  if (loading) return <Loader />

  const addNewFilter = () => {
    setCategoriesToPrint((prev) => [...prev, []])
    setCategoryPrinters((prev) => [...prev, ""])
    setFilterKeys((prev) => [...prev, createFilterGroupKey()])
  }

  const removeFilter = (index: number) => {
    if (categoriesToPrint.length > 1) {
      setCategoriesToPrint((prev) =>
        prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
      )
      setCategoryPrinters((prev) => prev.filter((_, i) => i !== index))
      setFilterKeys((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const updateFilter = (index: number, value: string[]) => {
    setCategoriesToPrint((prev) => {
      const updated = [...prev]
      updated[index] = value
      return normalizeUpdatedGroups(updated, index)
    })
  }

  const updatePrinter = (index: number, value: string) => {
    setCategoryPrinters((prev) => {
      const updated = [...prev]
      while (updated.length < categoriesToPrint.length) {
        updated.push("")
      }
      updated[index] = value
      return updated
    })
  }

  const filterRows = categoriesToPrint.map((filterGroup, index) => ({
    filterGroup,
    filterKey: filterKeys[index],
    index,
  }))

  return (
    <div className="w-full space-y-3">
      {filterRows.map(({ filterGroup, filterKey, index }) => {
        const canRemove = categoriesToPrint.length > 1

        return (
          <div
            key={filterKey}
            className={cn(
              "grid gap-2 border border-border/70 rounded-md p-2 sm:items-end",
              qzEnabled &&
                canRemove &&
                "sm:grid-cols-[minmax(0,1.25fr)_minmax(150px,1fr)_2.25rem]",
              qzEnabled &&
                !canRemove &&
                "sm:grid-cols-[minmax(0,1.25fr)_minmax(150px,1fr)]",
              !qzEnabled && canRemove && "sm:grid-cols-[minmax(0,1fr)_2.25rem]",
              !qzEnabled && !canRemove && "sm:grid-cols-1"
            )}
          >
            <div className="min-w-0 space-y-1">
              <div className="px-1 text-[11px] font-medium text-muted-foreground">
                Ангилал
              </div>
              <FacetedFilter
                options={(categories || []).map((category) => ({
                  label: category.name,
                  value: category.order,
                }))}
                title="бэлтгэх"
                values={filterGroup}
                onSelect={(value) => updateFilter(index, value)}
                className="min-w-0 overflow-hidden text-xs border-solid shadow-sm h-9 border-input bg-background"
              />
            </div>

            {qzEnabled && (
              <div className="min-w-0 space-y-1">
                <div className="px-1 text-[11px] font-medium text-muted-foreground">
                  Принтер
                </div>
                <Select
                  value={categoryPrinters[index] || ""}
                  onValueChange={(value) => updatePrinter(index, value)}
                  disabled={printersLoading || printers.length === 0}
                >
                  <SelectTrigger
                    className="text-xs shadow-sm h-9 bg-background"
                    loading={printersLoading}
                  >
                    <SelectValue placeholder="Принтер сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {printers.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {canRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFilter(index)}
                className="h-9 w-9 justify-self-end text-muted-foreground hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove filter group ${index + 1}`}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )
      })}

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
