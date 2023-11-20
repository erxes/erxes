"use client"

import React from "react"
import dynamic from "next/dynamic"

const ArticleDetail = dynamic(
  () =>
    import("@/modules/discover/components/knowledgebase/article/ArticleDetail")
)

const page = () => {
  return <ArticleDetail />
}

export default page
