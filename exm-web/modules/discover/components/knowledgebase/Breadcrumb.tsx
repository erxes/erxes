import React, { useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { IKbCategory, IKbParentCategory } from "../../types"

type Props = {
  categories: IKbParentCategory[]
  selectedCat: IKbCategory
}

const Breadcrumb = ({ categories, selectedCat }: Props) => {
  let subCats

  if (categories && categories.length > 0) {
    subCats = categories.find((cat) =>
      cat.childrens.find((child) => child._id === selectedCat._id)
    )
  }

  const renderCat = (cat: IKbCategory | undefined) => {
    if (!cat) {
      return null
    }

    if (cat) {
      return (
        <>
          <ChevronRight size={16} />
          <Link href={`/discover/category?catId=${cat._id}`}>
            <span>{cat.title}</span>
          </Link>
        </>
      )
    }
  }

  return (
    <div className="mx-9 my-5 flex items-center">
      <Link href="/discover">
        <div className="flex items-center">
          <span className="inline-block text-[14px] cursor-pointer text-[#6c718b] mr-1">
            All categories
          </span>
          {renderCat(subCats)}
          {renderCat(selectedCat) || ""}
        </div>
      </Link>
    </div>
  )
}

export default Breadcrumb
