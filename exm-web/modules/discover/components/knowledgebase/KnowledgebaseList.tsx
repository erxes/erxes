import React from "react"
import Link from "next/link"
import { MenuSquare, User } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {
  topics: any
}

const KnowledgebaseList = ({ topics }: Props) => {
  return (
    <div className="flex flex-col px-9 py-5">
      {topics?.parentCategories?.map((topic, index: number) => (
        <div key={index} className="flex flex-col gap-2">
          <h1 className="text-[18px] font-semibold">{topic.title}</h1>
          <h4 className="text-[14px] font-normal">{topic.description}</h4>

          <div className="grid grid-cols-3 gap-4 py-4">
            {topic.childrens?.map((child, index: number) => (
              <article
                key={index}
                className="bg-white rounded-lg p-[24px] flex flex-col gap-4 justify-center"
              >
                <div className="text-[16px] font-semibold">{child.title}</div>
                <p className="text-[14px] font-normal line-clamp-4 text-justify">
                  {child.description}
                </p>
                <div className="flex justify-between text-[12px] font-medium mt-auto">
                  <p className="flex gap-1 items-start ">
                    <MenuSquare size={16} /> {child.numOfArticles} Articles
                  </p>
                  <p className="flex gap-1 items-start">
                    <User size={16} /> {child.authors.length} Authors
                  </p>
                </div>
                <Link href={`/discover/category?catId=${child._id}`}>
                  <Button className="w-full">Read More</Button>
                </Link>
              </article>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KnowledgebaseList
