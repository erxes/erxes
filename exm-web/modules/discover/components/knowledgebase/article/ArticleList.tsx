"use client"

import React from "react"
import Link from "next/link"
import { IArticle, IKbArticle } from "@/modules/discover/types"
import dayjs from "dayjs"

import Loader from "@/components/ui/loader"

import { useArticles } from "../../../hooks/useArticles"
import EmptyList from "../EmptyList"

type Props = {
  categoryId?: string
  topicId?: string
  searchValue?: string
}

const ArticleList = ({ categoryId, topicId, searchValue }: Props) => {
  const { articles, loading } = useArticles({
    topicId,
    categoryId,
    searchValue,
  })

  if (loading) {
    return (
      <div className="flex w-full h-[200px] justify-center">
        <Loader />
      </div>
    )
  }
  if (articles.length === 0) {
    return (
      <div className="px-9 w-full">
        <EmptyList />
      </div>
    )
  }

  return (
    <div className="px-9 w-full">
      <ul role="list">
        {articles.map((article: any, index: number) => (
          <Link
            key={index}
            href={`/discover/article?id=${article._id}&catId=${article.categoryId}`}
            className="cursor-pointer"
          >
            <li className="flex justify-between gap-x-6 p-5 bg-white mb-5 rounded-md">
              <div className="group relative w-full">
                <h3 className="text-[18px] font-semibold leading-5 text-gray-900 group-hover:text-gray-600">
                  <span className="absolute inset-0" />
                  {article.title}
                </h3>
                <p className="mt-5 line-clamp-3 text-[14px] leading-5 text-gray-600 text-justify">
                  {article.summary}
                </p>
                <div className="relative w-full mt-auto pt-5 flex items-center justify-between text-[14px]">
                  <span className="flex items-center space-x-1">
                    Written by
                    <span className="capitalize ml-1">
                      {article.createdUser.details.fullName || ""}
                    </span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <p className="text-gray-600">
                      {dayjs(article.createdDate).format("MMM DD YYYY")}
                    </p>
                    <p className="text-gray-600">Viewed {article.viewCount}</p>
                  </span>
                </div>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  )
}

export default ArticleList
