import { useEffect, useState } from "react"
import { activeCategoryAtom, productCountAtom, searchAtom } from "@/store"
import { useQuery } from "@apollo/client"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { IProduct, IUseProducts } from "@/types/product.types"
import { getMode } from "@/lib/utils"

import { queries } from "../graphql"

export const useProducts = (props?: {
  skip?: boolean
  perPage?: number
  onCompleted?: (product: IProduct[]) => void
}): IUseProducts => {
  const { skip, perPage, onCompleted } = props || {}

  const [search] = useAtom(searchAtom)
  const [searchValue, setSearchValue] = useState(search)
  const categoryId = useAtomValue(activeCategoryAtom)
  const setProductCount = useSetAtom(productCountAtom)

  const { data, loading, fetchMore } = useQuery(queries.products, {
    variables: {
      perPage: perPage || FETCH_MORE_PER_PAGE,
      categoryId: categoryId,
      searchValue: searchValue,
      page: 1,
      groupedSimilarity: getMode() === "coffee-shop" ? "config" : null,
    },
    skip,
    onCompleted(data) {
      const products = (data || {}).poscProducts || []
      !!onCompleted && onCompleted(products)
    },
  })
  const countQuery = useQuery(queries.productsCount, {
    variables: {
      categoryId,
      searchValue,
      groupedSimilarity: getMode() === "coffee-shop" ? "config" : null,
    },
    onCompleted(data) {
      setProductCount((data || {}).poscProductsTotalCount || 0)
    },
  })

  const products = (data || {}).poscProducts || []
  const productsCount = (countQuery.data || {}).poscProductsTotalCount || 0

  const handleLoadMore = () => {
    if (productsCount > products.length) {
      fetchMore({
        variables: {
          page: Math.ceil(products.length / FETCH_MORE_PER_PAGE) + 1,
          perPage: FETCH_MORE_PER_PAGE,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev
          return Object.assign({}, prev, {
            poscProducts: [
              ...(prev.poscProducts || []),
              ...fetchMoreResult.poscProducts,
            ],
          })
        },
      })
    }
  }

  useEffect(() => {
    const timeOutId = setTimeout(() => setSearchValue(search), 500)
    return () => clearTimeout(timeOutId)
  }, [search, setSearchValue])

  return {
    loading: loading || countQuery.loading,
    products,
    productsCount,
    handleLoadMore,
  }
}

export const FETCH_MORE_PER_PAGE: number = 20
