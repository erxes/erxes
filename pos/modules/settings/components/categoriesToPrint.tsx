import useProductCategories from "@/modules/products/hooks/useProductCategories"
import {
  categoriesToPrintAtom,
  printConfigurationsAtom,
  PrintConfiguration,
} from "@/store"
import { configAtom } from "@/store/config.store"
import { useAtom, useAtomValue } from "jotai"

import { ICategory } from "@/types/product.types"
import { FacetedFilter } from "@/components/ui/faceted-filter"
import Loader from "@/components/ui/loader"

const CategoriesToPrint = () => {
  const [categoriesToPrint, setCategoriesToPrint] = useAtom(
    categoriesToPrintAtom
  )
  const [printConfigurations, setPrintConfigurations] = useAtom(
    printConfigurationsAtom
  )
  const config = useAtomValue(configAtom)
  const { isActive, isPrint } = config?.kitchenScreen || {}
  const { loading, categories } = useProductCategories((cats) => {
    setCategoriesToPrint(
      categoriesToPrint.filter((cat) =>
        cats.map((c: ICategory) => c.order).includes(cat)
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

  const firstFilterCategories = getMainCategories(rootCategories)
  const firstFilterOptions = firstFilterCategories
    .filter((category) => category.order && category.name)
    .sort((a, b) => (a.order || "").localeCompare(b.order || ""))
    .map((category) => {
      const depth = (category.order || "").split("/").length - 1
      const indent = "  ".repeat(depth)
      return {
        label: `${indent}${category.name}`,
        value: category.order || "",
        category: category,
      }
    })

  const firstFilterCategoryOrders = new Set(firstFilterCategories.map(cat => cat.order))
  const secondFilterOptions = (categories || [])
    .filter((category) => 
      category.order && 
      category.name && 
      !firstFilterCategoryOrders.has(category.order)
    )
    .sort((a, b) => (a.order || "").localeCompare(b.order || ""))
    .map((category) => {
      const depth = (category.order || "").split("/").length - 1
      const indent = "  ".repeat(depth)
      return {
        label: `${indent}${category.name}`,
        value: category.order || "",
        category: category,
      }
    })

  const handlePrintConfigChange = (selectedCategories: string[]) => {
    if (selectedCategories.length === 0) {
      setPrintConfigurations([])
      return
    }

    const categoryNames = selectedCategories
      .map((order) => {
        const category = secondFilterOptions.find((opt) => opt.value === order)
        return category?.category?.name || (order || "").split("/").pop() || order
      })
      .join(" + ")

    const newConfig: PrintConfiguration = {
      id: "main",
      name: categoryNames,
      categories: selectedCategories,
      enabled: true,
    }

    setPrintConfigurations([newConfig])
  }

  return (
    <div className="space-y-4">
      <FacetedFilter
        options={firstFilterOptions}
        title="Бэлтгэх ангилалууд (Хуучин)"
        className="mb-5"
        values={categoriesToPrint}
        onSelect={(value) => setCategoriesToPrint(value)}
      />

      <FacetedFilter
        options={secondFilterOptions}
        title="Бэлтгэх ангилалууд"
        className="mb-5"
        values={printConfigurations[0]?.categories || []}
        onSelect={handlePrintConfigChange}
      />
    </div>
  )
}

export default CategoriesToPrint