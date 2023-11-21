"use client"

import React, { useContext } from "react"
import { useSearchParams } from "next/navigation"
import { useCategory } from "@/modules/discover/hooks/useCategory"
import { useDiscover } from "@/modules/discover/hooks/useDiscover"
import { Topic } from "@/modules/discover/types"

import Loader from "@/components/ui/loader"

import Breadcrumb from "../Breadcrumb"
import { KnowledgebaseContext } from "../KnowledgebaseProvider"
import ArticleList from "../article/ArticleList"
import CategoryList from "./CategoryList"

type Props = {}

const CategoryDetail = (props: Props) => {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get("catId")
  const searchValue = searchParams.get("searchValue")

  const { knowledgebase } = useContext(KnowledgebaseContext)

  const { category } = useCategory({
    id: categoryId || "",
  })

  if (!knowledgebase) {
    return <Loader />
  }

  return (
    <div className="flex flex-col">
      <Breadcrumb
        categories={knowledgebase?.parentCategories}
        selectedCat={category}
      />
      <div className="flex">
        <CategoryList categoryId={categoryId!} topic={knowledgebase} />
        <ArticleList categoryId={categoryId!} searchValue={searchValue!} />
      </div>
    </div>
  )
}

export default CategoryDetail
