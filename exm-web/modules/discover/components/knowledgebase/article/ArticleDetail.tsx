"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { exmAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"

import Loader from "@/components/ui/loader"

import { useDiscover } from "../../../hooks/useDiscover"
import CategoryList from "../category/CategoryList"
import SingleArticle from "./SingleArticle"

const CategoryDetail = () => {
  const exm = useAtomValue(exmAtom)

  const searchParams = useSearchParams()
  const categoryId = searchParams.get("catId")
  const articleId = searchParams.get("id")

  const { topics, loading } = useDiscover({ id: exm?.knowledgeBaseTopicId! })

  if (loading) {
    return (
      <div className="flex w-full h-[200px] justify-center">
        <Loader />
      </div>
    )
  }
  return (
    <div className="flex w-full justify-between">
      <CategoryList topics={topics} categoryId={categoryId!} />
      <SingleArticle articleId={articleId!} />
    </div>
  )
}

export default CategoryDetail
