import React from "react"
import { useArticle } from "@/modules/discover/hooks/useArticle"
import dayjs from "dayjs"

import Loader from "@/components/ui/loader"

type Props = {
  articleId: any
}

const SingleArticle = ({ articleId }: Props) => {
  const { article, loading } = useArticle(articleId)

  if (loading) {
    return <Loader />
  }

  return (
    <div className="bg-white w-9/12 px-10 py-5 flex flex-col  gap-4">
      <div className="text-[14px] font-normal flex justify-between">
        <p className="capitalize">
          written by {article.createdUser?.details?.fullName}
        </p>
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
      <h1 className="text-[16px] font-semibold">{article.title}</h1>

      <div dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
  )
}

export default SingleArticle
