import { gql, useQuery } from "@apollo/client"

const POSC_PRODUCT_CONDITIONS = gql`
  query poscProductConditions($productId: String!) {
    poscProductConditions(productId: $productId) {
      _id
      code
      name
    }
  }
`

export interface ProductCondition {
  _id: string
  code: string
  name: string
}

// Lines of one product share the cached list; it refreshes on each mount.
export const useProductConditions = (productId?: string | null) => {
  const { data, loading } = useQuery<{
    poscProductConditions: ProductCondition[]
  }>(POSC_PRODUCT_CONDITIONS, {
    variables: { productId },
    skip: !productId,
    fetchPolicy: "cache-and-network",
  })

  return {
    conditions: data?.poscProductConditions || [],
    loading,
  }
}
