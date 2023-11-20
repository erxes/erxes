"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useCategory } from "@/modules/discover/hooks/useCategory"
import { useDiscover } from "@/modules/discover/hooks/useDiscover"

type Props = {
  categoryId: string
  topic: any
  config: any
}

const CategoryList = ({ categoryId, topic, config }: Props) => {
  return (
    <div className="w-3/12 px-10 py-5 flex flex-col gap-5">
      {topic?.parentCategories?.map((n, index) => (
        <div key={index}>
          <Link href={`/discover/category?catId=${n._id}`}>
            <h1 className="text-[16px] font-medium">
              {index + 1} . {n.title}
            </h1>
          </Link>
          <ul className="pl-8 pt-2">
            {n.childrens.map((i, index) => (
              <Link
                href={`/discover/category?catId=${i._id}`}
                key={index}
                className={`flex justify-between py-2 ${
                  categoryId === i._id ? "#551A8B font-bold" : ""
                }`}
              >
                <p>{i.title}</p>
                <p>{i.numOfArticles}</p>
              </Link>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default CategoryList
