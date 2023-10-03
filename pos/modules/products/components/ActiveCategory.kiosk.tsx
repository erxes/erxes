import { activeCategoryAtom } from "@/store"
import { useQuery } from "@apollo/client"
import { useAtomValue } from "jotai"

import { queries } from "../graphql"

const ActiveCategory = () => {
  const _id = useAtomValue(activeCategoryAtom)

  const { data, loading } = useQuery(queries.getInitialCategory, {
    variables: { _id },
  })

  const { name } = data?.poscProductCategoryDetail || {}

  return (
    <h1 className="text-3xl font-extrabold relative pb-1 mb-4 inline-block border-b-2 border-primary mr-2">
      {loading ? "..." : name}
    </h1>
  )
}

export default ActiveCategory
