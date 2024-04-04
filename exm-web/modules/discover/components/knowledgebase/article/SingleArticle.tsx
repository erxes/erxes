"use client"

import React from "react"
import Link from "next/link"
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

  const getAuthor = () => {
    if (Object.keys(article).length === 0) {
      return null
    }

    const author = article?.createdUser?.details.fullName || ""
    const authorId = article?.createdUser?._id || ""

    return (
      <span className="flex items-center space-x-1">
        <span className="ml-1">
          Written by{" "}
          <Link href={`/company/team-members/detail?id=${authorId}`}>
            <span className="text-[#4F33AF] cursor-pointer capitalize font-semibold">
              {author}
            </span>
          </Link>
        </span>
      </span>
    )
  }

  const getViewCount = () => {
    if (Object.keys(article).length === 0) {
      return null
    }
    return (
      <span className="flex items-center space-x-5">
        <p className="text-gray-600">
          Modified at {dayjs(article.modifiedDate).format("MMM DD YYYY")}
        </p>
        <p className="text-gray-600">viewed {article.viewCount}</p>
      </span>
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

            <p className="mt-5 prose max-w-none text-[14px]">
              {article.summary}
            </p>
          </div>
          <div className="my-5">
            <div
              dangerouslySetInnerHTML={{ __html: article.content }}
              className="prose mt-5 max-w-none text-[14px]"
            />
          </div>
          <div className="relative w-full mt-auto pt-5 flex items-center justify-between text-[12px]">
            {getAuthor()}
            {getViewCount()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleArticle
