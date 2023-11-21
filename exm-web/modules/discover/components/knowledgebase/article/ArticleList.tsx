import React from "react"
import Link from "next/link"
import { useArticles } from "@/modules/discover/hooks/useArticles"
import dayjs from "dayjs"

import Loader from "@/components/ui/loader"

type Props = {
  searchValue?: any
  categoryId?: string
  topicId?: string
}

const ArticleList = ({ searchValue, categoryId, topicId }: Props) => {
  const { articles, loading } = useArticles({
    searchValue: searchValue || "",
    categoryIds: [categoryId!],
    topicId: topicId || "",
  })

  if (loading) {
    return <Loader />
  }

  return (
    <div className="w-full px-10 py-5 flex flex-col gap-5">
      {articles.map((article, index: number) => (
        <Link
          key={index}
          href={`/discover/article?id=${article._id}&catId=${categoryId}`}
        >
          <div className="bg-white p-5 flex flex-col gap-4">
            <h6 className="text-[16px] font-semibold">{article.title}</h6>
            <p className="text-[14px] font-normal line-clamp-4 text-justify">
              {article.summary}
            </p>
            <div className="text-[14px] font-normal flex justify-between">
              <p>written by {article.createdUser.details.fullName}</p>
              <div className="flex gap-2 items-center">
                <p>{dayjs(article.createdDate).format("MMM DD YYYY")}</p>
                <p>viewed {article.viewCount}</p>
                <div className="flex -space-x-4 rtl:space-x-reverse">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      className="w-5 h-5 border-2 border-white rounded-full dark:border-gray-800"
                      src="/docs/images/people/profile-picture-5.jpg"
                      alt=""
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default ArticleList
