import useProductCategories from "@/modules/products/hooks/useProductCategories"
import {
  categoriesToPrintAtom,
  qzCategoryPrintersAtom,
  qzTrayEnabledAtom,
} from "@/store"
import { configAtom } from "@/store/config.store"
import { useAtom, useAtomValue } from "jotai"
import { Plus } from "lucide-react"

import { ICategory } from "@/types/product.types"
import useQzPrinters from "@/lib/useQzPrinters"
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
      categoriesToPrint.map((filterGroup) =>
        filterGroup.filter((cat) => validOrders.includes(cat))
      )
    )
  }, isActive || !isPrint)

  const { printers, loading: printersLoading } = useQzPrinters(qzEnabled)

  if (isActive || !isPrint) {
    return null
  }

  if (loading) return <Loader />

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
    setCategoriesToPrint((prev) => [...prev, []])
    setCategoryPrinters((prev) => [...prev, ""])
  }

  const removeFilter = (index: number) => {
    if (categoriesToPrint.length > 1) {
      setCategoriesToPrint((prev) =>
        prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
      )
      setCategoryPrinters((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const updateFilter = (index: number, value: string[]) => {
    setCategoriesToPrint((prev) => {
      const updated = [...prev]
      updated[index] = value
      return updated
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

  return (
    <div className="space-y-3 w-full">
      {categoriesToPrint.map((filterGroup, index) => (
        <div
          key={`category-filter-${index}-${(filterGroup || []).join("|")}`}
          className="flex gap-2 items-center"
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

          {qzEnabled && (
            <div className="flex-1 min-w-[140px]">
              <Select
                value={categoryPrinters[index] || ""}
                onValueChange={(value) => updatePrinter(index, value)}
                disabled={printersLoading || printers.length === 0}
              >
                <SelectTrigger className="h-8 text-xs" loading={printersLoading}>
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

          {categoriesToPrint.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFilter(index)}
              className="p-0 w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
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
        <Plus className="mr-1 w-3 h-3" />
        Шинэ принт нэмэх
      </Button>
    </div>
  )
}

export default CategoriesToPrint
