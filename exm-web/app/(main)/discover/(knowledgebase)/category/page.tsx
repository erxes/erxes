import React from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"

const CategoryDetail = dynamic(
  () =>
    import(
      "@/modules/discover/components/knowledgebase/category/CategoryDetail"
    )
)
// const ArticleList = dynamic(
//   () =>
//     import("@/modules/discover/components/knowledgebase/article/ArticleList")
// )

const page = () => {
  return <CategoryDetail />
}

export default page
