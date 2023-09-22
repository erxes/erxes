import { useQuery } from "@apollo/client"

import { ICategory } from "@/types/product.types"

import { queries } from "../graphql"

const useProductCategories = (): {
  loading: boolean
  categories: ICategory[]
} => {
  const { loading, data } = useQuery(queries.productCategories, {
    variables: { perPage: 1000, parentId: "" },
  })

  const categories = (data || {}).poscProductCategories || []

  return { loading, categories }
}

export default useProductCategories
