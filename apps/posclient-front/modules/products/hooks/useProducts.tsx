import { useEffect, useState } from "react"
import {
  activeCategoryAtom,
  modeAtom,
  productCountAtom,
  searchAtom,
  toggleRemainderAtom,
} from "@/store"
import { useQuery } from "@apollo/client"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { IProduct, IUseProducts } from "@/types/product.types"

import { queries } from "../graphql"

export const useProducts = (props?: {
  skip?: boolean
  perPage?: number
  sortField?: string
  sortDirection?: number
  minDiscountValue?: number
  maxDiscountValue?: number
  minDiscountPercent?: number
  maxDiscountPercent?: number
  discountConditions?: Record<string, unknown>
  onCompleted?: (product: IProduct[]) => void
}): IUseProducts => {
  const {
    skip,
    perPage,
    sortField,
    sortDirection,
    minDiscountValue,
    maxDiscountValue,
    minDiscountPercent,
    maxDiscountPercent,
    discountConditions,
    onCompleted,
  } = props || {}
  const [search] = useAtom(searchAtom)
  const [searchValue, setSearchValue] = useState(search)
  const categoryId = useAtomValue(activeCategoryAtom)
  const toggleRemainder = useAtomValue(toggleRemainderAtom)
  const setProductCount = useSetAtom(productCountAtom)
  const mode = useAtomValue(modeAtom)

  const isKiosk = mode === "kiosk"
  // main-family layouts and coffee-shop collapse bulk-similarity groups to
  // their starred product; searching stays ungrouped so exact variant codes
  // remain findable
  const isMainList = ["main", "restaurant", "mobile", "coffee-shop"].includes(
    mode
  )

  const { data, loading, fetchMore } = useQuery(queries.products, {
    variables: {
      perPage: perPage || FETCH_MORE_PER_PAGE,
      categoryId: categoryId,
      minRemainder: toggleRemainder ? 0.005 : undefined,
      minDiscountValue,
      maxDiscountValue,
      minDiscountPercent,
      maxDiscountPercent,
      discountConditions,
      sortField,
      sortDirection,
      searchValue: searchValue,
      page: 1,
      isSimilarity: isMainList && !searchValue ? true : undefined,
      isKiosk: isKiosk ? true : undefined,
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
      minRemainder: toggleRemainder ? 0.005 : undefined,
      minDiscountValue,
      maxDiscountValue,
      minDiscountPercent,
      maxDiscountPercent,
      discountConditions,
      searchValue,
      isSimilarity: isMainList && !searchValue ? true : undefined,
      isKiosk: isKiosk ? true : undefined,
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
