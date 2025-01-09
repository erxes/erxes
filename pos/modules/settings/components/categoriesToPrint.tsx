import useProductCategories from "@/modules/products/hooks/useProductCategories"
import { categoriesToPrintAtom } from "@/store"
import { configAtom } from "@/store/config.store"
import { useAtom, useAtomValue } from "jotai"

import { ICategory } from "@/types/product.types"
import { FacetedFilter } from "@/components/ui/faceted-filter"
import Loader from "@/components/ui/loader"

const CategoriesToPrint = () => {
  const [categoriesToPrint, setCategoriesToPrint] = useAtom(
    categoriesToPrintAtom
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

  return (
    <FacetedFilter
      options={getMainCategories(rootCategories).map((category) => ({
        label: category.name,
        value: category.order,
      }))}
      title="Бэлтгэх ангилалууд"
      className="mb-5"
      values={categoriesToPrint}
      onSelect={(value) => setCategoriesToPrint(value)}
    />
  )
}

export default CategoriesToPrint
