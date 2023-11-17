import React from "react"
import { useArticle } from "@/modules/discover/hooks/useArticle"
import dayjs from "dayjs"

type Props = {}

const ArticleList = (props: Props) => {
  const { articles, loading } = useArticle({
    id: "rWgiSJ6LPMFijp3SP",
  })

  const date = dayjs().format("MMM DD YYYY")

  return (
    <div className="w-9/12 px-10 py-5 flex flex-col gap-5">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
        <div key={n} className="bg-white p-5 flex flex-col gap-4">
          <h6 className="text-[16px] font-semibold">
            Sign up and get started !
          </h6>
          <p className="text-[14px] font-normal line-clamp-4 text-justify">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type
          </p>
          <div className="text-[14px] font-normal flex justify-between">
            <p>written by User</p>
            <div className="flex gap-2 items-center">
              <p>{date}</p>
              <p>view</p>
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
      ))}
    </div>
  )
}

export default ArticleList
