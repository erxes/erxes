import { useQuery } from "@apollo/client"

import { ICategory } from "@/types/product.types"

import { queries } from "../graphql"

const useProductCategories = (
  onCompleted?: (data: any) => void,
  skip?: boolean
): {
  loading: boolean
  categories: ICategory[]
} => {
  const { loading, data } = useQuery(queries.productCategories, {
    variables: { perPage: 1000, parentId: "" },
    onCompleted(data) {
      !!onCompleted && onCompleted((data || {}).poscProductCategories || [])
    },
    skip,
  })

  const categories = (data || {}).poscProductCategories || []

  return { loading, categories }
}

export default useProductCategories
