import React from "react"
import dynamic from "next/dynamic"

const CategoryDetail = dynamic(
  () =>
    import(
      "@/modules/discover/components/knowledgebase/category/CategoryDetail"
    )
)

const page = () => {
  return <CategoryDetail />
}

export default page
