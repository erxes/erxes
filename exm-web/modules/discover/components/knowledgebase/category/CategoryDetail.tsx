"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { useCategory } from "@/modules/discover/hooks/useCategory"
import { useDiscover } from "@/modules/discover/hooks/useDiscover"
import { Topic } from "@/modules/discover/types"

import Breadcrumb from "../Breadcrumb"
import ArticleList from "../article/ArticleList"
import CategoryList from "./CategoryList"

type Props = {}

const CategoryDetail = (props: Props) => {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get("catId")
  const searchValue = searchParams.get("searchValue")

  const { config, topic, loading } = useDiscover({
    id: "-WK9kACSlXMqIoS8-Qqdy",
  })

  const { category } = useCategory({
    id: categoryId || "",
  })

  return (
    <div className="flex flex-col">
      <Breadcrumb categories={topic?.parentCategories} selectedCat={category} />
      <div className="flex">
        <CategoryList categoryId={categoryId!} topic={topic} config={config} />
        <ArticleList categoryId={categoryId!} searchValue={searchValue!} />
      </div>
    </div>
  )
}

export default CategoryDetail
