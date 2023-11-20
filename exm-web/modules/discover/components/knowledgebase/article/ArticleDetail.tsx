"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { useCategory } from "@/modules/discover/hooks/useCategory"
import { useDiscover } from "@/modules/discover/hooks/useDiscover"

import Loader from "@/components/ui/loader"

import Breadcrumb from "../Breadcrumb"
import CategoryList from "../category/CategoryList"
import ArticleList from "./ArticleList"
import SingleArticle from "./SingleArticle"

type Props = {}

const ArticleDetail = (props: Props) => {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get("catId")
  const articleId = searchParams.get("id")
  const searchValue = searchParams.get("searchValue")

  const { config, topic, loading } = useDiscover({
    id: "-WK9kACSlXMqIoS8-Qqdy",
  })

  const { category } = useCategory({
    id: categoryId || "",
  })

  if (loading) {
    return <Loader />
  }

  if (searchValue) {
    return <ArticleList searchValue={searchValue!} topicId={topic._id} />
  }

  return (
    <div className="flex flex-col">
      <Breadcrumb categories={topic?.parentCategories} selectedCat={category} />
      <div className="flex">
        <CategoryList categoryId={categoryId!} topic={topic} config={config} />
        <SingleArticle articleId={articleId} />
      </div>
    </div>
  )
}

export default ArticleDetail
