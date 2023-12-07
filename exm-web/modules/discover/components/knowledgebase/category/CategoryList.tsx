"use client"

import React from "react"
import Link from "next/link"
import { IKbCategory, IKbParentCategory, Topic } from "@/modules/discover/types"

type Props = {
  categoryId: string
  topics: Topic
}

const CategoryList = ({ categoryId, topics }: Props) => {
  return (
    <div className="pl-9 w-3/12 max-w-sm">
      {topics?.parentCategories.map(
        (topic: IKbParentCategory, index: number) => (
          <ul key={index} className="text-slate-700 text-sm mb-5">
            <li>
              <Link
                href={`/discover/category?catId=${topic._id}`}
                className={`block py-1 text-[14px] ${
                  categoryId === topic._id ? "font-bold" : "font-bold"
                }`}
              >
                {index + 1}. {topic.title}
              </Link>
            </li>
            {topic.childrens.map((child: IKbCategory, childIndex: number) => (
              <li key={childIndex} className="ml-4">
                <Link
                  href={`/discover/category?catId=${child._id}`}
                  className={`group flex justify-between gap-2 items-center py-1 dark:hover:text-slate-300 ${
                    categoryId === child._id ? "font-semibold" : "font-medium"
                  }`}
                >
                  <p>{child.title}</p>
                  <p>{child.numOfArticles}</p>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}

export default CategoryList
