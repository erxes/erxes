"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { useArticles } from "../../hooks/useArticles"

type Props = {}

const KnowledgebaseHeader = (props: Props) => {
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

  return (
    <div className="flex flex-col bg-[#4F33AF] px-9 py-5 text-[#fff] gap-3">
      <div className="text-[18px] font-normal leading-7">
        <span className="text-[#A251E1] font-medium">Exm </span>
        Гарын авлагууд
      </div>
      <div className="font-normal text-[12px] leading-6">
        A knowledge-sharing help center designed specially for the erxes
        community
      </div>
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
