"use client"

import React from "react"
import dayjs from "dayjs"

import Loader from "@/components/ui/loader"

import { useArticle } from "../../../hooks/useArticle"

type Props = {
  articleId: string
}

const SingleArticle = ({ articleId }: Props) => {
  const { article, loading } = useArticle(articleId)

  if (loading) {
    return (
      <div className="flex w-full h-[200px] justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="px-9 w-full">
      <div className="flex justify-between p-5 bg-white mb-5 rounded-md">
        <div className="flex flex-col group w-full divide-y">
          <div>
            <h3 className="w-full text-[18px] font-semibold leading-5 text-gray-900">
              {article.title}
            </h3>

            <p className="mt-5 prose max-w-none">{article.summary}</p>
          </div>
          <div className="my-5">
            <div
              dangerouslySetInnerHTML={{ __html: article.content }}
              className="prose mt-5 max-w-none"
            />
          </div>
          <div className="relative w-full mt-auto pt-5 flex items-center justify-between text-[14px]">
            <span className="flex items-center space-x-1">
              Written by
              <span className="capitalize ml-1">
                {article?.createdUser?.details.fullName}
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
      </div>
    </div>
  )
}

export default SingleArticle
