"use client"

import React, { useContext, useState } from "react"
import { useRouter } from "next/navigation"
import { exmAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"
import { Search } from "lucide-react"

import { KnowledgebaseContext } from "./KnowledgebaseProvider"

const KnowledgebaseHeader = () => {
  const exm = useAtomValue(exmAtom)
  const { knowledgebase } = useContext(KnowledgebaseContext)

  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const handleSearchInput = (e: any) => {
    setSearchValue(e.target.value)
  }

  const onSubmit = () => {
    router.push(`/discover/article?searchValue=${searchValue}`)
  }

  const onEnterPress = (e: any) => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault()
      onSubmit()
    }
  }

  const color = knowledgebase?.color
    ? knowledgebase?.color
    : exm?.appearance.headerColor
    ? exm?.appearance.headerColor
    : "#4F33AF"

  const description = knowledgebase?.description
    ? knowledgebase?.description
    : exm?.webDescription
    ? exm?.webDescription
    : ""

  return (
    <div className={`flex flex-col bg-[${color}] p-9 text-[#fff] gap-3`}>
      <div className="text-[18px] font-normal leading-7">
        <span className="text-[#A251E1] font-medium">
          {exm?.webName || "Exm"}{" "}
        </span>
        Guide
      </div>
      <div className="font-normal text-[12px] leading-6">{description}</div>
      <div className="flex justify-between items-center px-4 py-2 border border-white rounded-md w-5/5">
        <input
          type="text"
          placeholder="Search for articles"
          className="bg-transparent w-full"
          onChange={handleSearchInput}
          onKeyDown={onEnterPress}
        />
        <Search color="#fff" size={16} />
      </div>
    </div>
  )
}

export default KnowledgebaseHeader
