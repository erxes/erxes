"use client"

import { exmAtom } from "@/modules/JotaiProiveder"
import { useDiscover } from "@/modules/discover/hooks/useDiscover"

import "@/styles/globals.css"
import { useSearchParams } from "next/navigation"
import Breadcrumb from "@/modules/discover/components/knowledgebase/Breadcrumb"
import ArticleList from "@/modules/discover/components/knowledgebase/article/ArticleList"
import { useCategory } from "@/modules/discover/hooks/useCategory"
import { useAtomValue } from "jotai"

interface ILayoutProps {
  children: React.ReactNode
}

export default function KnowledgebaseLayout({ children }: ILayoutProps) {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get("catId")
  const searchValue = searchParams.get("searchValue")

  const exm = useAtomValue(exmAtom)
  const { topics } = useDiscover({ id: exm?.knowledgeBaseTopicId! })
  const { category } = useCategory({ id: categoryId! })

  if (searchValue) {
    return (
      <div className="py-5 flex flex-col w-full gap-5">
        <p className="px-9 w-full text-[14px]">
          Search result for:{" "}
          <span className="font-semibold">{searchValue}</span>
        </p>
        <ArticleList topicId={topics._id} searchValue={searchValue} />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Breadcrumb
        categories={topics?.parentCategories}
        selectedCat={category}
      />

      {children}
    </div>
  )
}
