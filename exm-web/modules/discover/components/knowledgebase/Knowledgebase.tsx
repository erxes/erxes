"use client"

import React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { exmAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"
import { MenuSquare, UserSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import Loader from "@/components/ui/loader"

import { useDiscover } from "../../hooks/useDiscover"
import { IKbCategory, IKbParentCategory, Topic } from "../../types"
import EmptyList from "./EmptyList"
import ArticleList from "./article/ArticleList"

const Knowledgebase = () => {
  const searchParams = useSearchParams()
  const exm = useAtomValue(exmAtom)

  const { topics, loading } = useDiscover({ id: exm?.knowledgeBaseTopicId! })

  const color = exm
    ? exm.appearance.primaryColor
    : topics
    ? topics.color
    : "#4f46e5"

  if (loading) {
    return (
      <div className="flex w-full h-[200px] justify-center">
        <Loader />
      </div>
    )
  }

  if (!topics || Object.keys(topics).length === 0) {
    return (
      <div className="px-9 w-full">
        <EmptyList />
      </div>
    )
  }

  const searchValue = searchParams.get("searchValue")
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

  const renderArticle = (child: IKbCategory) => {
    const numOfAuthors = child.authors
      ? new Set(child.authors.map((author: any) => author._id)).size
      : 0

    return (
      <article className="flex flex-col items-start justify-between bg-white py-5 px-3.5 rounded-md">
        <div className="group relative">
          <h3 className="text-[18px] font-semibold leading-5 text-gray-900 group-hover:text-gray-600">
            <span className="absolute inset-0" />
            {child.title}
          </h3>
          <p className="mt-5 line-clamp-4 text-[14px] leading-5 text-gray-600 text-justify">
            {child.description}
          </p>
        </div>
        <div className="relative w-full mt-auto pt-5 flex items-center justify-between text-[14px]">
          <span className="flex items-center space-x-1">
            <MenuSquare size={16} />
            <p className="text-gray-600">{child.numOfArticles}</p>
            <p className="text-gray-600">Articles</p>
          </span>
          <span className="flex items-center space-x-1">
            <UserSquare size={16} />
            <p className="text-gray-600">{numOfAuthors}</p>
            <p className="text-gray-600">Authors</p>
          </span>
        </div>
        <Link
          href={`/discover/category?catId=${child._id}`}
          className="mt-5 w-full font-semibold"
        >
          <Button
            className={`w-full`}
            style={{
              backgroundColor: color,
            }}
          >
            Read More
          </Button>
        </Link>
      </article>
    )
  }

  return (
    <div className="py-9">
      {topics.parentCategories.map(
        (topic: IKbParentCategory, index: number) => (
          <div key={index} className="mx-auto px-9 mb-9">
            <div className="mx-auto  lg:mx-0">
              <h2 className="text-[18px] font-bold tracking-tight text-gray-900 sm:text-[18px]">
                {topic.title}
              </h2>
              <p className="mt-5 text-[14px] leading-5 text-gray-600">
                {topic.description}
              </p>
            </div>
            <div className="mx-auto mt-5 grid grid-cols-1 gap-x-9 gap-y-5 sm:mt-5 lg:mx-0 lg:max-w-none lg:grid-cols-3 ">
              {topic.childrens.map((child: IKbCategory, childIndex: number) => (
                <React.Fragment key={childIndex}>
                  {renderArticle(child)}
                </React.Fragment>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default Knowledgebase
