"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { exmAtom } from "@/modules/JotaiProiveder"
import { useDiscover } from "@/modules/discover/hooks/useDiscover"
import { useAtomValue } from "jotai"

import Loader from "@/components/ui/loader"

import ArticleList from "../article/ArticleList"
import CategoryList from "./CategoryList"

const CategoryDetail = () => {
  const exm = useAtomValue(exmAtom)

  const searchParams = useSearchParams()
  const categoryId = searchParams.get("catId")

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
      <ArticleList topicId={topics._id} categoryId={categoryId!} />
    </div>
  )
}

export default CategoryDetail
